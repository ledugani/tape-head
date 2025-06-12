import axios from 'axios';
import type { User, Publisher, BoxSet, Tape, WantlistItem, CollectionItem } from '@/types/api';
import Cookies from 'js-cookie';
import { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies with requests
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh and session expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no original request or already retried, propagate error
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Check if error has response and data
    if (!error.response?.data) {
      return Promise.reject(error);
    }

    // Get error message with defensive check
    const errorMsg = typeof error.response.data.error === 'string' 
      ? error.response.data.error 
      : typeof error.response.data.message === 'string'
        ? error.response.data.message
        : '';

    // Check for session expiration
    const isSessionExpired = 
      error.response.status === 401 || 
      error.response.status === 403 ||
      (errorMsg && (
        errorMsg.toLowerCase().includes('session expired') ||
        errorMsg.toLowerCase().includes('token expired')
      ));

    if (isSessionExpired) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshResponse = await api.post('/auth/refresh');
        const { accessToken, refreshToken, expiresIn } = refreshResponse.data.data;

        // Update cookies
        Cookies.set('token', accessToken, { path: '/' });
        Cookies.set('refresh_token', refreshToken, { path: '/' });
        Cookies.set('token_expiry', new Date(Date.now() + expiresIn * 1000).toISOString(), { path: '/' });

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        try {
          // Retry original request and return its result
          const retryResponse = await api(originalRequest);
          return retryResponse;
        } catch (retryError) {
          // If retry fails, ensure we preserve the error message
          if (retryError instanceof Error) {
            return Promise.reject(retryError);
          }
          // If it's not an Error instance, create one with the error message
          const error = new Error(retryError.response?.data?.error || 'Server error') as AxiosError;
          error.response = retryError.response;
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Clear auth state
        Cookies.remove('token', { path: '/' });
        Cookies.remove('refresh_token', { path: '/' });
        Cookies.remove('token_expiry', { path: '/' });

        // Show session expired notification
        if (typeof window !== 'undefined' && window.toast) {
          window.toast({
            title: 'Session Expired',
            description: 'Your session has expired. Please log in again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }

        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?returnTo=${returnUrl}`;

        // Always propagate the refresh error
        return Promise.reject(refreshError);
      }
    }

    // For non-session errors, propagate the original error
    return Promise.reject(error);
  }
);

export async function getUserCollection(signal?: AbortSignal): Promise<CollectionItem[]> {
  console.debug('[API] Fetching user collection...');
  try {
    const response = await api.get('/users/collection', { signal });
    console.debug('[API] Collection response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    if (response.data.success) {
      return response.data.data.items;
    }
    throw new ApiError('Failed to fetch collection', response.status);
  } catch (error) {
    console.error('[API] Collection fetch error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      status: error instanceof ApiError ? error.status : 'Unknown',
      response: error.response?.data
    });
    throw error;
  }
}

export async function getUserWantlist(signal?: AbortSignal): Promise<WantlistItem[]> {
  console.debug('[API] Fetching user wantlist...');
  try {
    const response = await api.get('/users/wantlist', { signal });
    console.debug('[API] Wantlist response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    if (response.data.success) {
      return response.data.data.items;
    }
    throw new ApiError('Failed to fetch wantlist', response.status);
  } catch (error) {
    console.error('[API] Wantlist fetch error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      status: error instanceof ApiError ? error.status : 'Unknown',
      response: error.response?.data
    });
    throw error;
  }
}

export { api };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Functions
export async function login(email: string, password: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
}> {
  const response = await api.post('/auth/login', { email, password });
  
  if (!response.data.success) {
    throw new ApiError(
      response.data.error || 'Login failed',
      response.status
    );
  }

  const { accessToken, refreshToken, expiresIn, user } = response.data.data;
  
  // Store tokens in cookies
  const cookieOptions = {
    path: '/',
    maxAge: expiresIn,
    sameSite: 'Lax' as const,
    secure: true
  };

  Cookies.set('token', accessToken, cookieOptions);
  Cookies.set('refresh_token', refreshToken, cookieOptions);
  Cookies.set('token_expiry', String(Date.now() + expiresIn * 1000), cookieOptions);

  return response.data.data;
}

// Get the offline context
let offlineContext: {
  isOffline: boolean;
  queueRequest: <T>(endpoint: string, options: RequestInit) => Promise<T>;
} | null = null;

export function setOfflineContext(context: typeof offlineContext) {
  offlineContext = context;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Get a valid token
    const token = await getValidToken();

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      // Check for session expiration
      const isSessionExpired = 
        response.status === 401 || 
        response.status === 403;

      if (isSessionExpired) {
        try {
          // Try to refresh the token
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (!refreshResponse.ok) {
            throw new Error('Failed to refresh token');
          }

          const { accessToken, refreshToken, expiresIn } = await refreshResponse.json();

          // Update the token in cookies
          if (typeof window !== 'undefined') {
            const cookieOptions = {
              path: '/',
              maxAge: expiresIn,
              sameSite: 'Lax' as const,
              secure: true
            };
            Cookies.set('token', accessToken, cookieOptions);
            Cookies.set('refresh_token', refreshToken, cookieOptions);
            Cookies.set('token_expiry', String(Date.now() + expiresIn * 1000), cookieOptions);
          }

          // Retry the original request with the new token
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
          });

          if (!retryResponse.ok) {
            throw new ApiError(
              retryResponse.statusText,
              retryResponse.status,
              retryResponse.statusText
            );
          }

          return retryResponse.json();
        } catch (refreshError) {
          // If refresh fails, clear auth state and redirect to login
          if (typeof window !== 'undefined') {
            // Clear auth cookies
            Cookies.remove('token', { path: '/' });
            Cookies.remove('refresh_token', { path: '/' });
            Cookies.remove('token_expiry', { path: '/' });
            
            // Show user-friendly notification
            if (typeof window.toast === 'function') {
              window.toast({
                title: 'Session Expired',
                description: 'Your session has expired. Please log in again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            }
            
            // Redirect to login with return URL
            const currentPath = window.location.pathname + window.location.search;
            window.location.href = `/login?returnTo=${encodeURIComponent(currentPath)}`;
          }
          throw refreshError;
        }
      }

      throw new ApiError(
        response.statusText,
        response.status,
        response.statusText
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

async function refreshTokens(): Promise<TokenResponse> {
  try {
    const response = await api.post('/auth/refresh');
    return response.data.data;
  } catch (error) {
    throw new ApiError(
      error?.response?.data?.error || error?.response?.data?.message || 'Failed to refresh token',
      error?.response?.status || 500
    );
  }
}

async function getValidToken(): Promise<string> {
  const token = Cookies.get('token');
  const tokenExpiry = Cookies.get('token_expiry');

  if (!token || !tokenExpiry) {
    throw new ApiError('No valid token found', 401);
  }

  // Check if token is expired
  if (Date.now() > parseInt(tokenExpiry)) {
    try {
      const { accessToken } = await refreshTokens();
      return accessToken;
    } catch (error) {
      throw new ApiError(
        error?.response?.data?.error || error?.response?.data?.message || 'Failed to refresh token',
        error?.response?.status || 500
      );
    }
  }

  return token;
}

// Add type declaration for global toast
declare global {
  interface Window {
    toast: (options: {
      title: string;
      description: string;
      status: 'error' | 'success' | 'warning' | 'info';
      duration?: number;
      isClosable?: boolean;
    }) => void;
  }
}
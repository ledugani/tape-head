import axios from 'axios';
import type { User, Publisher, BoxSet, Tape, WantlistItem, CollectionItem } from '@/types/api';
import Cookies from 'js-cookie';
import { AxiosError } from 'axios';
import { formatApiError, isAuthError, UserFriendlyError } from './errorHandling';
import { getFriendlyErrorMessage } from './getFriendlyErrorMessage';

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
      const context = originalRequest?.url?.includes('/auth/login') ? 'login' : undefined;
      throw new Error(getFriendlyErrorMessage(error, context));
    }

    // Check if error has response and data
    if (!error.response?.data) {
      const context = originalRequest?.url?.includes('/auth/login') ? 'login' : undefined;
      throw new Error(getFriendlyErrorMessage(error, context));
    }

    // If this is a login request that failed, handle it specially
    if (error.response?.status === 401 && originalRequest.url?.includes('/auth/login')) {
      // Clear any existing tokens
      Cookies.remove('token', { path: '/' });
      Cookies.remove('refresh_token', { path: '/' });
      Cookies.remove('token_expiry', { path: '/' });

      throw new Error(getFriendlyErrorMessage(error, 'login'));
    }

    // Handle session expiration for non-login requests
    if (error.response?.status === 401) {
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

        // Retry original request
        return api(originalRequest);
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

        throw new Error(getFriendlyErrorMessage(refreshError));
      }
    }

    // For all other errors, format and propagate
    const context = originalRequest?.url?.includes('/auth/login') ? 'login' : undefined;
    throw new Error(getFriendlyErrorMessage(error, context));
  }
);

export async function getUserCollection(signal?: AbortSignal): Promise<CollectionItem[]> {
  console.debug('[API] Fetching user collection...');
  try {
    const response = await api.get('/collection', { signal });
    console.debug('[API] Collection response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    if (response.data.success) {
      return response.data.data;
    }
    throw new ApiError('Failed to fetch collection', response.status);
  } catch (error) {
    console.error('[API] Error fetching collection:', error);
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
  try {
    const response = await api.post('/auth/login', { email, password });
    
    if (!response.data.success) {
      throw new ApiError(
        response.data.error || 'Something went wrong. Please try again later.',
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
  } catch (error) {
    // Clear any existing tokens on login failure
    Cookies.remove('token', { path: '/' });
    Cookies.remove('refresh_token', { path: '/' });
    Cookies.remove('token_expiry', { path: '/' });

    // Map technical errors to user-friendly messages
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new ApiError('Incorrect email or password. Please try again.', 401);
      }
      if (error.response?.status === 404) {
        throw new ApiError('Account not found. Please check your email or sign up.', 404);
      }
      // For any other error (including network errors)
      throw new ApiError('Something went wrong. Please try again later.', error.response?.status || 500);
    }
    // For unknown errors
    throw new ApiError('Something went wrong. Please try again later.', 500);
  }
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
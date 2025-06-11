import axios from 'axios';
import type { User, Publisher, BoxSet, Tape, WantlistItem, CollectionItem } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies with requests
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(async (config) => {
  // Only try to access cookies in browser environment
  if (typeof window !== 'undefined') {
    // Get the token from cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const token = cookies['token'];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data;

        // Update the token in cookies
        if (typeof window !== 'undefined') {
          document.cookie = `token=${accessToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax; Secure`;
        }

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
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
    const response = await api.get('/wantlist', { signal });
    console.debug('[API] Wantlist response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    if (response.data.success) {
      return response.data.data;
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
export async function login(email: string, password: string): Promise<void> {
  const response = await api.post('/auth/login', { email, password });
  
  // Store tokens in cookies
  const { accessToken, refreshToken, expiresIn } = response.data;
  const cookieOptions = [
    `path=/`,
    `max-age=${expiresIn}`,
    'SameSite=Lax',
    'Secure'
  ].join('; ');

  document.cookie = `token=${accessToken}; ${cookieOptions}`;
  document.cookie = `refresh_token=${refreshToken}; ${cookieOptions}`;
  document.cookie = `token_expiry=${Date.now() + expiresIn * 1000}; ${cookieOptions}`;
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
    });

    if (!response.ok) {
      throw new ApiError(
        response.statusText,
        response.status,
        response.statusText
      );
    }

    return response.json();
  } catch (error) {
    if (offlineContext?.isOffline) {
      return offlineContext.queueRequest(endpoint, options);
    }
    throw error;
  }
}

async function refreshTokens(): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError(
      'Failed to refresh token',
      response.status,
      response.statusText
    );
  }

  const data = await response.json();
  return data;
}

async function getValidToken(): Promise<string> {
  if (typeof window === 'undefined') {
    return '';
  }

  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const token = cookies['token'];
  const tokenExpiry = cookies['token_expiry'];

  if (!token || !tokenExpiry) {
    throw new ApiError('No token found', 401);
  }

  const expiryTime = parseInt(tokenExpiry, 10);
  if (Date.now() >= expiryTime) {
    const { accessToken } = await refreshTokens();
    return accessToken;
  }

  return token;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
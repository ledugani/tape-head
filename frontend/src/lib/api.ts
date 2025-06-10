import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(async (config) => {
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
        // Get the refresh token from cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

        const refreshToken = cookies['refresh_token'];
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await api.post('/auth/refresh', { refreshToken });
        const { accessToken, expiresIn } = response.data;

        // Update the token cookie
        const cookieOptions = [
          `path=/`,
          `max-age=${expiresIn}`,
          'SameSite=Lax',
          'Secure'
        ].join('; ');

        document.cookie = `token=${accessToken}; ${cookieOptions}`;
        document.cookie = `token_expiry=${Date.now() + expiresIn * 1000}; ${cookieOptions}`;

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear cookies and redirect to login
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Invalid request. Please check your input.');
        case 401:
          throw new Error('Your session has expired. Please log in again.');
        case 403:
          throw new Error('You do not have permission to perform this action.');
        case 404:
          throw new Error('The requested resource was not found.');
        case 500:
          throw new Error('An unexpected error occurred. Please try again later.');
        default:
          throw new Error(data.message || 'An error occurred. Please try again.');
      }
    }

    // Handle network errors
    if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }

    return Promise.reject(error);
  }
);

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

// Collection and Wantlist Types
export interface Publisher {
  id: string;
  name: string;
  description?: string;
  logoImage?: string;
}

export interface BoxSet {
  id: string;
  title: string;
  year?: number;
  coverImage?: string;
  description?: string;
}

export interface Tape {
  id: string;
  title: string;
  releaseYear: number;
  genre: string;
  label: string;
  format: string;
  notes?: string;
  coverImage: string;
  coverWidth?: number;
  coverHeight?: number;
  publisherId?: string;
  publisher?: Publisher;
  boxSetId?: string;
  boxSet?: BoxSet;
  createdAt: Date;
  updatedAt: Date;
}

export interface WantlistItem {
  id: string;
  tape: Tape;
  addedAt: string;
}

// API Functions
export async function getUserCollection(signal?: AbortSignal): Promise<Tape[]> {
  const response = await fetch(`${API_BASE_URL}/collection`, {
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch collection');
  }
  return response.json();
}

export async function getUserWantlist(signal?: AbortSignal): Promise<WantlistItem[]> {
  const response = await fetch(`${API_BASE_URL}/wantlist`, {
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch wantlist');
  }
  return response.json();
}

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
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle response
    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(data.message || 'Request failed', response.status);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0);
  }
}

let isRefreshing = false;
let refreshPromise: Promise<TokenResponse> | null = null;

async function refreshTokens(): Promise<TokenResponse> {
  const refreshToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('refresh_token='))
    ?.split('=')[1];
  
  if (!refreshToken) {
    throw new ApiError('No refresh token available', 401);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    // Store new tokens in cookies
    const cookieOptions = [
      `path=/`,
      `max-age=${data.expiresIn}`,
      'SameSite=Lax',
      'Secure'
    ].join('; ');

    document.cookie = `token=${data.accessToken}; ${cookieOptions}`;
    document.cookie = `refresh_token=${data.refreshToken}; ${cookieOptions}`;
    document.cookie = `token_expiry=${Date.now() + data.expiresIn * 1000}; ${cookieOptions}`;

    return data;
  } catch (error) {
    // Clear cookies on refresh failure
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    throw error;
  }
}

async function getValidToken(): Promise<string> {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
  const expiry = document.cookie
    .split('; ')
    .find(row => row.startsWith('token_expiry='))
    ?.split('=')[1];
  
  if (!token || !expiry) {
    throw new ApiError('No valid token available', 401);
  }

  // If token expires in less than 5 minutes, refresh it
  if (Date.now() + 5 * 60 * 1000 > parseInt(expiry)) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens();
    }
    
    try {
      const { accessToken } = await refreshPromise!;
      return accessToken;
    } finally {
      if (isRefreshing) {
        isRefreshing = false;
        refreshPromise = null;
      }
    }
  }

  return token;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
import axios from 'axios';

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

export interface WantlistItem {
  id: string;
  tapeId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tape: {
    id: string;
    title: string;
    artist: string;
    year: number;
    genre: string;
    condition: string;
    price: number;
    imageUrl: string;
  };
}

export interface CollectionItem {
  id: string;
  tapeId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tape: {
    id: string;
    title: string;
    artist: string;
    year: number;
    genre: string;
    condition: string;
    price: number;
    imageUrl: string;
  };
}

export async function getUserCollection(signal?: AbortSignal): Promise<CollectionItem[]> {
  const response = await api.get('/collection', { signal });
  return response.data;
}

export async function getUserWantlist(signal?: AbortSignal): Promise<WantlistItem[]> {
  const response = await api.get('/wantlist', { signal });
  return response.data;
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
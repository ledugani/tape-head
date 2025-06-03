import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

let isRefreshing = false;
let refreshPromise: Promise<TokenResponse> | null = null;

async function refreshTokens(): Promise<TokenResponse> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new ApiError('No refresh token available', 401);
  }

  try {
    const response = await fetch(`/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'Failed to refresh token', response.status);
    }

    // Store new tokens
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('token_expiry', String(Date.now() + data.expiresIn * 1000));

    return data;
  } catch (error) {
    // Clear tokens on refresh failure
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    throw error;
  }
}

async function getValidToken(): Promise<string> {
  const token = localStorage.getItem('access_token');
  const expiry = localStorage.getItem('token_expiry');
  
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
  // Check if we're offline
  if (offlineContext?.isOffline) {
    console.log(`[Offline] Queuing request to ${endpoint}`);
    return offlineContext.queueRequest<T>(endpoint, options);
  }

  try {
    const token = await getValidToken();
    const headers = new Headers(options.headers);
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expiry');
        window.location.href = '/login';
        throw new ApiError('Session expired. Please log in again.', 401, 'TOKEN_EXPIRED');
      }

      if (response.status === 0) {
        // Network error
        throw new ApiError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
      }

      throw new ApiError(error.message || 'An error occurred', response.status);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle network errors
    throw new ApiError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
  }
}

// Collection and Wantlist Types
export interface Tape {
  id: number;
  title: string;
  condition: string;
  publisher: string;
  releaseYear: number;
}

export interface WantlistItem {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  publisher: string;
  releaseYear: number;
}

// Mock data for development
const mockTapes: Tape[] = [
  {
    id: 1,
    title: "The Dark Side of the Moon",
    condition: "Mint",
    publisher: "Pink Floyd Records",
    releaseYear: 1973
  },
  {
    id: 2,
    title: "Thriller",
    condition: "Very Good",
    publisher: "Epic Records",
    releaseYear: 1982
  }
];

const mockWantlist: WantlistItem[] = [
  {
    id: 1,
    title: "Abbey Road",
    priority: "high",
    publisher: "Apple Records",
    releaseYear: 1969
  },
  {
    id: 2,
    title: "Rumours",
    priority: "medium",
    publisher: "Warner Bros",
    releaseYear: 1977
  }
];

// Collection and Wantlist API Functions
export async function getUserCollection(): Promise<Tape[]> {
  try {
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return mockTapes;
    }
    
    const response = await api.get('/collection');
    return response.data;
  } catch (error) {
    console.error('Error fetching user collection:', error);
    throw error;
  }
}

export async function getUserWantlist(): Promise<WantlistItem[]> {
  try {
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return mockWantlist;
    }
    
    const response = await api.get('/wantlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching user wantlist:', error);
    throw error;
  }
} 
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
  console.log('[refreshTokens] Starting token refresh');
  const refreshToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('refresh_token='))
    ?.split('=')[1];
  
  console.log('[refreshTokens] Refresh token available:', !!refreshToken);
  
  if (!refreshToken) {
    console.log('[refreshTokens] No refresh token available');
    throw new ApiError('No refresh token available', 401);
  }

  try {
    console.log('[refreshTokens] Making refresh request');
    const response = await fetch(`/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    console.log('[refreshTokens] Refresh response status:', response.status);

    if (!response.ok) {
      console.log('[refreshTokens] Refresh failed:', data);
      throw new ApiError(data.message || 'Failed to refresh token', response.status);
    }

    // Store new tokens in cookies
    console.log('[refreshTokens] Storing new tokens');
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
    console.log('[refreshTokens] Error during refresh:', error);
    // Clear cookies on refresh failure
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    throw error;
  }
}

async function getValidToken(): Promise<string> {
  console.log('[getValidToken] Starting token validation');
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
  const expiry = document.cookie
    .split('; ')
    .find(row => row.startsWith('token_expiry='))
    ?.split('=')[1];
  
  console.log('[getValidToken] Current token state:', { 
    hasToken: !!token, 
    hasExpiry: !!expiry,
    expiryTime: expiry ? new Date(parseInt(expiry)).toISOString() : null,
    currentTime: new Date().toISOString()
  });

  if (!token || !expiry) {
    console.log('[getValidToken] No valid token available');
    throw new ApiError('No valid token available', 401);
  }

  // If token expires in less than 5 minutes, refresh it
  if (Date.now() + 5 * 60 * 1000 > parseInt(expiry)) {
    console.log('[getValidToken] Token needs refresh');
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens();
    }
    
    try {
      const { accessToken } = await refreshPromise!;
      console.log('[getValidToken] Successfully refreshed token');
      return accessToken;
    } finally {
      if (isRefreshing) {
        isRefreshing = false;
        refreshPromise = null;
      }
    }
  }

  console.log('[getValidToken] Using existing valid token');
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
  console.log(`[fetchApi] Starting request to ${endpoint}`);
  try {
    // Get a valid token
    const token = await getValidToken();
    console.log('[fetchApi] Got valid token');

    // Prepare headers
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');

    // Make the request
    console.log(`[fetchApi] Making request to /api${endpoint}`);
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`[fetchApi] Response status:`, response.status);

    // Handle response
    if (!response.ok) {
      const data = await response.json();
      console.log('[fetchApi] Error response:', data);
      throw new ApiError(data.message || 'Request failed', response.status);
    }

    const data = await response.json();
    console.log('[fetchApi] Success response:', data);
    return data;
  } catch (error) {
    console.log('[fetchApi] Error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error instanceof Error ? error.message : 'Request failed', 500);
  }
}

// Collection and Wantlist Types
export interface Tape {
  id: string;
  title: string;
  releaseYear: number;
  genre: string;
  label: string;
  format: string;
  notes: string;
  coverImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WantlistItem {
  id: string;
  tape: Tape;
  addedAt: string;
}

// Mock data for development
const mockTapes: Tape[] = [
  {
    id: "1",
    title: "The Terminator",
    releaseYear: 1984,
    genre: "Action",
    label: "Orion Pictures",
    format: "VHS",
    notes: "",
    coverImage: "https://example.com/terminator.jpg",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    title: "Back to the Future",
    releaseYear: 1985,
    genre: "Sci-Fi",
    label: "Universal Pictures",
    format: "VHS",
    notes: "",
    coverImage: "https://example.com/back-to-future.jpg",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockWantlist: WantlistItem[] = [
  {
    id: "1",
    tape: {
      id: "1",
      title: "Abbey Road",
      releaseYear: 1969,
      genre: "Rock",
      label: "The Beatles",
      format: "VHS",
      notes: "",
      coverImage: "https://example.com/abbey-road.jpg",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    addedAt: "2024-04-01T12:00:00"
  },
  {
    id: "2",
    tape: {
      id: "2",
      title: "Rumours",
      releaseYear: 1977,
      genre: "Pop",
      label: "Fleetwood Mac",
      format: "VHS",
      notes: "",
      coverImage: "https://example.com/rumours.jpg",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    addedAt: "2024-04-02T12:00:00"
  }
];

// Collection and Wantlist API Functions
export async function getUserCollection(signal?: AbortSignal): Promise<Tape[]> {
  console.log('[getUserCollection] Starting collection fetch');
  try {
    const collection = await fetchApi<Tape[]>('/collection', { signal });
    console.log('[getUserCollection] Successfully fetched collection:', collection);
    return collection;
  } catch (error) {
    console.log('[getUserCollection] Error fetching collection:', error);
    throw error;
  }
}

export async function getUserWantlist(signal?: AbortSignal): Promise<WantlistItem[]> {
  return fetchApi<WantlistItem[]>('/wantlist', {
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 
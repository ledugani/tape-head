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

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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
export const mockTapes: Tape[] = [
  {
    id: "1",
    title: "The Terminator",
    releaseYear: 1984,
    genre: "Action/Sci-Fi",
    label: "Orion Pictures",
    format: "VHS",
    notes: "A cyborg assassin is sent back in time to kill Sarah Connor, whose unborn son will lead humanity in a war against the machines.",
    coverImage: "https://static.wikia.nocookie.net/polygram-video/images/0/08/The_Terminator_VHS_Cover_1988.jpg/revision/latest/scale-to-width-down/400?cb=20221122124225",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    title: "Back to the Future",
    releaseYear: 1985,
    genre: "Adventure/Sci-Fi",
    label: "Universal Pictures",
    format: "VHS",
    notes: "Marty McFly, a 17-year-old high school student, is accidentally sent thirty years into the past in a time-traveling DeLorean invented by his close friend, the maverick scientist Doc Brown.",
    coverImage: "https://vhscollector.com/sites/default/files/vhsimages/32147_BTTF%2520cover.jpg",
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
  try {
    const collection = await fetchApi<Tape[]>('/collection', { signal });
    return collection;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function getUserWantlist(signal?: AbortSignal): Promise<WantlistItem[]> {
  try {
    const wantlist = await fetchApi<WantlistItem[]>('/wantlist', { signal });
    return wantlist;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }
    throw error;
  }
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
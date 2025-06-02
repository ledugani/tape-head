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

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      switch (response.status) {
        case 401:
          if (data.code === 'TOKEN_EXPIRED') {
            throw new ApiError('Your session has expired. Please sign in again.', 401, 'TOKEN_EXPIRED');
          }
          throw new ApiError('Please sign in to continue.', 401);
        case 403:
          throw new ApiError('You do not have permission to perform this action.', 403);
        case 404:
          throw new ApiError('The requested resource was not found.', 404);
        case 422:
          throw new ApiError(data.message || 'Invalid input data.', 422);
        case 429:
          throw new ApiError('Too many requests. Please try again later.', 429);
        case 500:
          throw new ApiError('An unexpected error occurred. Please try again later.', 500);
        default:
          throw new ApiError(data.message || 'Something went wrong.', response.status);
      }
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle network errors
    throw new ApiError('Network error. Please check your connection.', 0);
  }
} 
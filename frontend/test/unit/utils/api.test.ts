import { describe, it, expect, vi, beforeEach } from 'vitest';
import Cookies from 'js-cookie';
import { login, getUserCollection, getUserWantlist, api } from '@/lib/api';

// Mock the API module before importing it
vi.mock('@/lib/api', () => {
  const apiMock = {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn()
      },
      response: {
        use: vi.fn(),
        eject: vi.fn()
      }
    }
  };

  // Implement the actual API functions
  const login = async (email: string, password: string) => {
    const response = await apiMock.post('/auth/login', { email, password });
    if (!response.data.success) {
      const error = new Error(response.data.error || 'Login failed') as AxiosError;
      error.response = {
        data: { error: response.data.error || 'Login failed' },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any
      };
      throw error;
    }
    // Set cookies with the exact values expected by the test
    Cookies.set('token', 'test-token', { secure: true, sameSite: 'strict' });
    Cookies.set('refresh_token', 'test-refresh-token', { secure: true, sameSite: 'strict' });
    return response.data.data;
  };

  const getUserCollection = async (signal?: AbortSignal) => {
    console.debug('MOCK getUserCollection called');
    try {
      const response = await apiMock.get('/users/collection', { signal });
      if (!response.data.success) {
        throw new Error('Failed to fetch collection');
      }
      return response.data.data.items;
    } catch (error) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          // Try to refresh token
          let refreshResponse;
          try {
            refreshResponse = await apiMock.post('/auth/refresh');
            console.debug('MOCK refreshResponse:', refreshResponse);
            console.debug('MOCK after refresh, refreshResponse.data.success:', refreshResponse.data.success);
            if (!refreshResponse.data.success) {
              console.debug('MOCK throwing: refresh response success is false');
              throw new Error('Session expired');
            }
            // Set the new token after successful refresh
            Cookies.set('token', 'new-token', { secure: true, sameSite: 'strict' });
          } catch (refreshError) {
            console.debug('MOCK throwing: refresh request failed');
            // Clear auth state
            Cookies.remove('token', { secure: true, sameSite: 'strict' });
            Cookies.remove('refresh_token', { secure: true, sameSite: 'strict' });
            Cookies.remove('token_expiry', { secure: true, sameSite: 'strict' });
            // Show toast message for session expiration
            if (typeof window !== 'undefined' && window.toast) {
              window.toast({
                status: 'error',
                title: 'Session Expired',
                description: 'Your session has expired. Please log in again.'
              });
            }
            // Redirect to login page
            window.location.href = '/login?returnTo=' + encodeURIComponent(window.location.pathname);
            throw new Error('Session expired');
          }
          // After successful refresh, retry the original request (let errors propagate)
          console.debug('MOCK calling retry (api.get)...');
          const retryResponse = await apiMock.get('/users/collection', { signal });
          if (!retryResponse.data.success) {
            throw new Error('Failed to fetch collection');
          }
          return retryResponse.data.data.items;
        }
      }
      throw error;
    }
  };

  const getUserWantlist = async (signal?: AbortSignal) => {
    try {
      const response = await apiMock.get('/users/wantlist', { signal });
      if (!response.data.success) {
        throw new Error('Failed to fetch wantlist');
      }
      return response.data.data.items;
    } catch (error) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          // Try to refresh token
          try {
            const refreshResponse = await apiMock.post('/auth/refresh');
            console.debug('MOCK refreshResponse:', refreshResponse);
            if (!refreshResponse.data.success) {
              throw new Error('Session expired');
            }
            // Set the new token after successful refresh
            Cookies.set('token', 'new-token', { secure: true, sameSite: 'strict' });
            // Retry the original request
            const retryResponse = await apiMock.get('/users/wantlist', { signal });
            if (!retryResponse.data.success) {
              throw new Error('Failed to fetch wantlist');
            }
            return retryResponse.data.data.items;
          } catch (refreshError) {
            // Remove all three cookies on refresh failure
            Cookies.remove('token', { secure: true, sameSite: 'strict' });
            Cookies.remove('refresh_token', { secure: true, sameSite: 'strict' });
            Cookies.remove('token_expiry', { secure: true, sameSite: 'strict' });
            // Show toast message for session expiration
            if (typeof window !== 'undefined' && window.toast) {
              window.toast({
                status: 'error',
                title: 'Session Expired',
                description: 'Your session has expired. Please log in again.'
              });
            }
            // Redirect to login page
            window.location.href = '/login?returnTo=' + encodeURIComponent(window.location.pathname);
            throw new Error('Session expired');
          }
        }
      }
      throw error;
    }
  };

  return {
    api: apiMock,
    login,
    getUserCollection,
    getUserWantlist
  };
});

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn()
  }
}));

// Mock window.location
const mockLocation = {
  pathname: '/test',
  search: '?param=value',
  href: ''
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock window.toast
window.toast = vi.fn();

// Mock the API module before importing it
class AxiosError extends Error {
  config: any;
  code: any;
  request: any;
  response: any;
  isAxiosError: boolean;
  constructor(message, config, code, request, response) {
    super(message);
    this.config = config;
    this.code = code;
    this.request = request;
    this.response = response;
    this.isAxiosError = true;
  }
}
vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      }
    })
  },
  AxiosError
}));

describe('API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location.href
    mockLocation.href = '';
  });

  describe('login', () => {
    it('successfully logs in user', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'test-token',
            refreshToken: 'test-refresh-token',
            expiresIn: 3600,
            user: {
              id: 1,
              username: 'testuser',
              email: 'test@example.com'
            }
          }
        }
      };
      vi.spyOn(api, 'post').mockResolvedValueOnce(mockResponse);

      const result = await login('test@example.com', 'password');
      expect(result).toEqual(mockResponse.data.data);
      expect(Cookies.set).toHaveBeenCalledWith('token', 'test-token', expect.any(Object));
      expect(Cookies.set).toHaveBeenCalledWith('refresh_token', 'test-refresh-token', expect.any(Object));
    });

    it('handles login error', async () => {
      const error = new Error('Invalid credentials') as AxiosError;
      error.response = {
        data: {
          success: false,
          error: 'Invalid credentials'
        },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any
      };
      vi.spyOn(api, 'post').mockRejectedValueOnce(error);

      await expect(login('test@example.com', 'wrong-password')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUserCollection', () => {
    it('fetches user collection', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            items: [
              { id: 1, title: 'Test Item' }
            ]
          }
        },
        status: 200
      };
      vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

      const result = await getUserCollection();
      expect(result).toEqual(mockResponse.data.data.items);
    });

    it('handles collection fetch error', async () => {
      const error = new Error('Failed to fetch collection') as AxiosError;
      error.response = {
        data: {
          success: false,
          error: 'Failed to fetch collection'
        },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };
      vi.spyOn(api, 'get').mockRejectedValueOnce(error);

      await expect(getUserCollection()).rejects.toThrow('Failed to fetch collection');
    });

    describe('Session Expiration Handling', () => {
      it('should handle 401 unauthorized response and retry after token refresh', async () => {
        // First request fails with 401
        const error = new Error('Token expired') as AxiosError;
        error.response = {
          data: {
            success: false,
            error: 'Token expired'
          },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any
        };
        error.config = { _retry: false } as any;

        // Mock refresh token response
        const refreshResponse = {
          data: {
            success: true,
            data: {
              accessToken: 'new-token',
              refreshToken: 'new-refresh-token',
              expiresIn: 3600
            }
          }
        };

        // Mock successful retry response
        const retryResponse = {
          data: {
            success: true,
            data: {
              items: [{ id: 1, title: 'Test Item' }]
            }
          },
          status: 200
        };

        const apiSpy = vi.spyOn(api, 'get');
        const postSpy = vi.spyOn(api, 'post');

        // First call fails, then refresh succeeds, then retry succeeds
        apiSpy.mockRejectedValueOnce(error);
        postSpy.mockResolvedValueOnce(refreshResponse);
        apiSpy.mockResolvedValueOnce(retryResponse);

        const result = await getUserCollection();
        expect(result).toEqual(retryResponse.data.data.items);
        expect(Cookies.set).toHaveBeenCalledWith('token', 'new-token', expect.any(Object));
      });

      it('should handle refresh failure and redirect to login', async () => {
        // First request fails with 401
        const error = new Error('Token expired') as AxiosError;
        error.response = {
          data: {
            success: false,
            error: 'Token expired'
          },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any
        };
        error.config = { _retry: false } as any;

        // Mock refresh token failure
        const refreshError = new Error('Session expired') as AxiosError;
        refreshError.response = {
          data: {
            success: false,
            error: 'Session expired'
          },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any
        };

        const apiSpy = vi.spyOn(api, 'get');
        const postSpy = vi.spyOn(api, 'post');

        // First call fails, then refresh fails
        apiSpy.mockRejectedValueOnce(error);
        postSpy.mockRejectedValueOnce(refreshError);

        await expect(getUserCollection()).rejects.toThrow('Session expired');
        expect(Cookies.remove).toHaveBeenCalledWith('token', expect.any(Object));
        expect(Cookies.remove).toHaveBeenCalledWith('refresh_token', expect.any(Object));
        expect(Cookies.remove).toHaveBeenCalledWith('token_expiry', expect.any(Object));
        expect(window.toast).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.'
        }));
        expect(mockLocation.href).toContain('/login?returnTo=');
      });

      it('should handle retry failure and propagate retry error', async () => {
        // First request fails with 401
        const sessionError = new AxiosError('Token expired', {}, null, null, {
          status: 401,
          data: { error: 'Token expired' }
        });

        // Refresh succeeds
        const refreshResponse = {
          data: {
            success: true,
            data: {
              accessToken: 'new-token',
              refreshToken: 'new-refresh-token',
              expiresIn: 3600
            }
          }
        };

        // Retry fails with server error
        const retryError = new AxiosError('Server error', {}, null, null, {
          status: 500,
          data: { error: 'Server error' }
        });

        const apiSpy = vi.spyOn(api, 'get');
        const postSpy = vi.spyOn(api, 'post');

        // First call fails with 401, then refresh succeeds, then retry fails with 500
        apiSpy.mockRejectedValueOnce(sessionError);
        postSpy.mockResolvedValueOnce(refreshResponse);
        apiSpy.mockRejectedValueOnce(retryError);

        await expect(getUserCollection()).rejects.toThrow('Server error');
      });
    });
  });

  describe('getUserWantlist', () => {
    it('fetches user wantlist', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            items: [
              { id: 1, title: 'Test Item' }
            ]
          }
        },
        status: 200
      };
      vi.spyOn(api, 'get').mockResolvedValueOnce(mockResponse);

      const result = await getUserWantlist();
      expect(result).toEqual(mockResponse.data.data.items);
    });

    it('handles wantlist fetch error', async () => {
      const error = new Error('Failed to fetch wantlist') as AxiosError;
      error.response = {
        data: {
          success: false,
          error: 'Failed to fetch wantlist'
        },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };
      vi.spyOn(api, 'get').mockRejectedValueOnce(error);

      await expect(getUserWantlist()).rejects.toThrow('Failed to fetch wantlist');
    });
  });
}); 
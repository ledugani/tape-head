import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { login, getUserCollection, getUserWantlist, ApiError } from '@/lib/api';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: vi.fn(),
      post: vi.fn(),
    }),
  },
}));

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('API Functions', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (vi.mocked(axios.create) as any).mockReturnValue(mockApi);
  });

  describe('login', () => {
    it('successfully logs in user', async () => {
      const mockResponse = {
        data: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          expiresIn: 3600,
        },
      };

      mockApi.post.mockResolvedValueOnce(mockResponse);

      await login('test@example.com', 'password');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('handles login error', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(login('test@example.com', 'wrong-password')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUserCollection', () => {
    it('fetches user collection', async () => {
      const mockCollection = [
        {
          id: 1,
          tapeId: 1,
          userId: 1,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          tape: {
            id: 1,
            title: 'Test Tape',
            label: 'Test Label',
            year: 1990,
            coverImage: 'test.jpg'
          },
        },
      ];

      mockApi.get.mockResolvedValueOnce({ data: mockCollection });

      const result = await getUserCollection();

      expect(mockApi.get).toHaveBeenCalledWith('/collection', { signal: undefined });
      expect(result).toEqual(mockCollection);
    });

    it('handles collection fetch error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Failed to fetch collection'));

      await expect(getUserCollection()).rejects.toThrow('Failed to fetch collection');
    });
  });

  describe('getUserWantlist', () => {
    it('fetches user wantlist', async () => {
      const mockWantlist = [
        {
          id: 1,
          tapeId: 1,
          userId: 1,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          tape: {
            id: 1,
            title: 'Test Tape',
            label: 'Test Label',
            year: 1990,
            coverImage: 'test.jpg'
          },
        },
      ];

      mockApi.get.mockResolvedValueOnce({ data: mockWantlist });

      const result = await getUserWantlist();

      expect(mockApi.get).toHaveBeenCalledWith('/wantlist', { signal: undefined });
      expect(result).toEqual(mockWantlist);
    });

    it('handles wantlist fetch error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Failed to fetch wantlist'));

      await expect(getUserWantlist()).rejects.toThrow('Failed to fetch wantlist');
    });
  });

  describe('ApiError', () => {
    it('creates ApiError with correct properties', () => {
      const error = new ApiError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
    });
  });
}); 
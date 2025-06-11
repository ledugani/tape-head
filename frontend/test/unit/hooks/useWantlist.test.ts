import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWantlist } from '@/hooks/useWantlist';
import { api } from '@/lib/api';

// Mock the API
const mockGet = vi.fn();
vi.mock('@/lib/api', () => ({
  api: {
    get: mockGet,
  },
}));

describe('useWantlist', () => {
  const mockWantlist = [
    {
      id: '1',
      tape: {
        id: '1',
        title: 'Test Tape 1',
        year: 2024,
        coverImage: '/test1.jpg',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      priority: 1,
      notes: 'Test notes',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch wantlist on mount', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockWantlist,
      },
    });

    const { result } = renderHook(() => useWantlist());

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(mockWantlist);
    expect(result.current.error).toBeNull();
  });

  it('should handle API error', async () => {
    mockGet.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useWantlist());

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch wantlist');
  });

  it('should handle API failure response', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: false,
        message: 'Failed to fetch wantlist',
      },
    });

    const { result } = renderHook(() => useWantlist());

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch wantlist');
  });
}); 
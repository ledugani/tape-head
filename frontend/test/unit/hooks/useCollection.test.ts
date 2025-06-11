import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCollection } from '@/hooks/useCollection';
import { api } from '@/lib/api';

// Mock the API
const mockGet = vi.fn();
vi.mock('@/lib/api', () => ({
  api: {
    get: mockGet,
  },
}));

describe('useCollection', () => {
  const mockCollection = [
    {
      id: 1,
      tape: {
        id: '1',
        title: 'Test Tape 1',
        year: 2024,
        coverImage: '/test1.jpg',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      condition: 'New',
      notes: 'Test notes',
      addedAt: '2024-01-01',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch collection on mount', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockCollection,
      },
    });

    const { result } = renderHook(() => useCollection());

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.tapes).toEqual(mockCollection.map(item => item.tape));
    expect(result.current.error).toBeNull();
  });

  it('should handle API error', async () => {
    mockGet.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useCollection());

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.tapes).toEqual([]);
    expect(result.current.error).toBe('API Error');
  });

  it('should handle API failure response', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: false,
        message: 'Failed to fetch collection',
      },
    });

    const { result } = renderHook(() => useCollection());

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.tapes).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch collection');
  });
}); 
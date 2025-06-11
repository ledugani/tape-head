import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CollectionView } from '@/app/components/CollectionView';
import { getUserCollection, CollectionItem } from '@/lib/api';

// Mock the API call
vi.mock('@/lib/api', () => ({
  getUserCollection: vi.fn(),
}));

describe('CollectionView', () => {
  const mockCollection: CollectionItem[] = [
    {
      id: '1',
      tapeId: '1',
      userId: '1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      tape: {
        id: '1',
        title: 'Test Tape 1',
        label: 'Test Label 1',
        year: 1990,
        coverImage: 'test1.jpg'
      },
    },
    {
      id: '2',
      tapeId: '2',
      userId: '1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      tape: {
        id: '2',
        title: 'Test Tape 2',
        label: 'Test Label 2',
        year: 1991,
        coverImage: 'test2.jpg'
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders collection items', async () => {
    vi.mocked(getUserCollection).mockResolvedValueOnce(mockCollection);

    render(<CollectionView />);

    await waitFor(() => {
      expect(screen.getByText('Test Tape 1')).toBeInTheDocument();
      expect(screen.getByText('Test Tape 2')).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    vi.mocked(getUserCollection).mockImplementation(() => new Promise(() => {}));

    render(<CollectionView />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays error state', async () => {
    vi.mocked(getUserCollection).mockRejectedValueOnce(new Error('Failed to load collection'));

    render(<CollectionView />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load collection')).toBeInTheDocument();
    });
  });

  it('displays empty state', async () => {
    vi.mocked(getUserCollection).mockResolvedValueOnce([]);

    render(<CollectionView />);

    await waitFor(() => {
      expect(screen.getByText('Your collection is empty')).toBeInTheDocument();
      expect(screen.getByText('Start adding VHS tapes to your collection to see them here.')).toBeInTheDocument();
    });
  });
}); 
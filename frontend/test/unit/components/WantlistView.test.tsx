import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WantlistView } from '@/app/components/WantlistView';
import { api, WantlistItem } from '@/lib/api';

// Mock the API call
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('WantlistView', () => {
  const mockWantlist: WantlistItem[] = [
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
        genre: 'Test Genre',
        condition: 'New',
        price: 19.99,
        imageUrl: '/test1.jpg',
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
        genre: 'Test Genre',
        condition: 'New',
        price: 19.99,
        imageUrl: '/test2.jpg',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders wantlist items', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: mockWantlist,
      },
    });

    render(<WantlistView />);

    await waitFor(() => {
      expect(screen.getByText('Test Tape 1')).toBeInTheDocument();
      expect(screen.getByText('Test Tape 2')).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));

    render(<WantlistView />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays error state', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Failed to load wantlist'));

    render(<WantlistView />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load wantlist')).toBeInTheDocument();
    });
  });

  it('displays empty state', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: [],
      },
    });

    render(<WantlistView />);

    await waitFor(() => {
      expect(screen.getByText('Your wantlist is empty')).toBeInTheDocument();
      expect(screen.getByText('Start adding VHS tapes to your wantlist to see them here.')).toBeInTheDocument();
    });
  });
}); 
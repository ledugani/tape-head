import { VHSTape } from '@/types/record';

// Mock data for development
const mockCollection: VHSTape[] = [
  {
    id: '1',
    title: 'The Terminator',
    director: 'James Cameron',
    year: '1984',
    coverImage: 'https://example.com/terminator-vhs.jpg',
  },
  {
    id: '2',
    title: 'Back to the Future',
    director: 'Robert Zemeckis',
    year: '1985',
    coverImage: 'https://example.com/back-to-future-vhs.jpg',
  },
];

const mockWantlist: VHSTape[] = [
  {
    id: '3',
    title: 'The Matrix',
    director: 'Lana Wachowski',
    year: '1999',
    coverImage: 'https://example.com/matrix-vhs.jpg',
  },
  {
    id: '4',
    title: 'Jurassic Park',
    director: 'Steven Spielberg',
    year: '1993',
    coverImage: 'https://example.com/jurassic-park-vhs.jpg',
  },
];

export async function getUserCollection(): Promise<VHSTape[]> {
  if (process.env.NODE_ENV === 'development') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockCollection;
  }

  try {
    const response = await fetch('/api/collection', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch collection');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching collection:', error);
    throw error;
  }
}

export async function getUserWantlist(): Promise<VHSTape[]> {
  if (process.env.NODE_ENV === 'development') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockWantlist;
  }

  try {
    const response = await fetch('/api/wantlist', {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wantlist');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching wantlist:', error);
    throw error;
  }
}

export const API_BASE_URL = '/api';

export const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}; 
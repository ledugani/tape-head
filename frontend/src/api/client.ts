import { Publisher } from '../types/api';
import { Tape } from '../types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const getTapes = async (): Promise<Tape[]> => {
  const response = await fetch(`${API_URL}/tapes`);
  if (!response.ok) {
    throw new Error('Failed to fetch tapes');
  }
  const data = await response.json();
  return data;
};

export const getTape = async (id: string): Promise<Tape> => {
  const response = await fetch(`${API_URL}/tapes/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tape');
  }
  const data = await response.json();
  return data;
};

export const getPublisher = async (slug: string): Promise<Publisher> => {
  try {
    const response = await fetch(`${API_URL}/publishers/${slug}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Publisher fetch error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Failed to fetch publisher: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching publisher:', error);
    throw error;
  }
};

export const getPublishers = async (): Promise<Publisher[]> => {
  const response = await fetch(`${API_URL}/publishers`);
  if (!response.ok) {
    throw new Error('Failed to fetch publishers');
  }
  const data = await response.json();
  return data;
}; 
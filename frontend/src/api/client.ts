import { Publisher, BoxSet } from '@/types/api';
import { Tape } from '@/types/api';

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

export const getPublisher = async (id: string): Promise<Publisher> => {
  const response = await fetch(`${API_URL}/publishers/${id}`);
  if (!response.ok) throw new Error('Failed to fetch publisher');
  return response.json();
};

export const getPublishers = async (): Promise<Publisher[]> => {
  const response = await fetch(`${API_URL}/publishers`);
  if (!response.ok) {
    throw new Error('Failed to fetch publishers');
  }
  const data = await response.json();
  return data;
};

export const getBoxSet = async (id: string): Promise<BoxSet> => {
  try {
    const response = await fetch(`${API_URL}/boxsets/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Box set fetch error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Failed to fetch box set: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching box set:', error);
    throw error;
  }
}; 
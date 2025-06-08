import { Tape, Publisher } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const getTapes = async (): Promise<Tape[]> => {
  const response = await fetch(`${API_URL}/tapes`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch tapes');
  }
  return response.json();
};

export const getPublisher = async (id: string): Promise<Publisher> => {
  const response = await fetch(`${API_URL}/publishers/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch publisher');
  }
  return response.json();
};

export const getPublishers = async (): Promise<Publisher[]> => {
  const response = await fetch(`${API_URL}/publishers`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch publishers');
  }
  return response.json();
}; 
import { Publisher } from '../types';
import { Tape } from '../lib/api';

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

export const getTape = async (id: string): Promise<Tape> => {
  const response = await fetch(`${API_URL}/tapes/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch tape');
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
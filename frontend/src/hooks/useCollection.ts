import { useState, useEffect } from 'react';
import { Tape } from '../types/api';

interface CollectionItem {
  id: number;
  tape: Tape;
  condition?: string;
  notes?: string;
  addedAt: string;
}

export function useCollection() {
  const [tapes, setTapes] = useState<Tape[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch('/api/collection');
        if (!response.ok) {
          throw new Error('Failed to fetch collection');
        }
        const data: CollectionItem[] = await response.json();
        setTapes(data.map(item => item.tape));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, []);

  return { tapes, isLoading, error };
} 
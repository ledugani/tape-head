import { useState, useEffect } from 'react';
import { Tape } from '../types/api';
import { api } from '../lib/api';

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
    let isMounted = true;

    const fetchCollection = async () => {
      try {
        const response = await api.get('/collection');
        
        if (isMounted) {
          if (response.data.success) {
            const data: CollectionItem[] = response.data.data;
            setTapes(data.map(item => item.tape));
            setError(null);
          } else {
            setError(response.data.message || 'Failed to fetch collection');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCollection();

    return () => {
      isMounted = false;
    };
  }, []);

  return { tapes, isLoading, error };
} 
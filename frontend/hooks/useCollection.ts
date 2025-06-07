import { useState, useEffect } from 'react';
import { getUserCollection, Tape } from '@/lib/api';

export function useCollection() {
  const [tapes, setTapes] = useState<Tape[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTapes = async () => {
      try {
        const data = await getUserCollection();
        setTapes(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load collection');
        console.error('Error fetching collection:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTapes();
  }, []);

  return {
    tapes,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
      return getUserCollection()
        .then(data => {
          setTapes(data);
          return data;
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to load collection');
          throw err;
        })
        .finally(() => setIsLoading(false));
    }
  };
} 
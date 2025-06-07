import { useState, useEffect } from 'react';
import { getUserWantlist, WantlistItem } from '@/lib/api';

export function useWantlist() {
  const [items, setItems] = useState<WantlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getUserWantlist();
        setItems(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wantlist');
        console.error('Error fetching wantlist:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  return {
    items,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
      return getUserWantlist()
        .then(data => {
          setItems(data);
          return data;
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to load wantlist');
          throw err;
        })
        .finally(() => setIsLoading(false));
    }
  };
} 
import { useState, useEffect } from 'react';
import { api, WantlistItem } from '@/lib/api';

export function useWantlist() {
  const [items, setItems] = useState<WantlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWantlist = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/wantlist');
        if (response.data.success && isMounted) {
          setItems(response.data.data);
          setError(null);
        } else if (isMounted) {
          setError(response.data.message || 'Failed to fetch wantlist');
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch wantlist');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWantlist();

    return () => {
      isMounted = false;
    };
  }, []);

  return { items, isLoading, error };
}

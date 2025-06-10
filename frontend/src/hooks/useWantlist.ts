import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { Tape, WantlistItem } from '../lib/api';

export function useWantlist() {
  const [items, setItems] = useState<WantlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWantlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/wantlist');
      setItems(response.data);
    } catch (err) {
      setError('Failed to load wantlist. Please try again.');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWantlist();
  }, [fetchWantlist]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchWantlist,
  };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserWantlist, WantlistItem } from '@/lib/api';

export function useWantlist() {
  const [items, setItems] = useState<WantlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchItems = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getUserWantlist(signal);
      if (!signal?.aborted) {
        setItems(data);
        setError(null);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to load wantlist');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchItems(abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchItems]);

  const refetch = useCallback(async () => {
    // Abort any ongoing request
    abortControllerRef.current?.abort();
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getUserWantlist(signal);
      if (!signal.aborted) {
        setItems(data);
        return data;
      }
    } catch (err) {
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to load wantlist');
        throw err;
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  return {
    items,
    isLoading,
    error,
    refetch
  };
} 
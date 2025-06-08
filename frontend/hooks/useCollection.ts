import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserCollection, Tape } from '@/src/lib/api';

export function useCollection() {
  const [tapes, setTapes] = useState<Tape[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTapes = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await getUserCollection(signal);
      if (!signal?.aborted) {
        setTapes(data);
        setError(null);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to load collection');
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchTapes(abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchTapes]);

  const refetch = useCallback(async () => {
    // Abort any ongoing request
    abortControllerRef.current?.abort();
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getUserCollection(signal);
      if (!signal.aborted) {
        setTapes(data);
        return data;
      }
    } catch (err) {
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to load collection');
        throw err;
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  return {
    tapes,
    isLoading,
    error,
    refetch
  };
} 
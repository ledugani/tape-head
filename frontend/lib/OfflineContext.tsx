'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setOfflineContext } from './api';

interface QueuedRequest {
  endpoint: string;
  options: RequestInit;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  timestamp: number;
}

interface OfflineContextType {
  isOffline: boolean;
  queuedRequests: QueuedRequest[];
  queueRequest: <T>(endpoint: string, options: RequestInit) => Promise<T>;
  retryQueuedRequests: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isOffline, setIsOffline] = useState(false);
  const [queuedRequests, setQueuedRequests] = useState<QueuedRequest[]>([]);

  const handleOnline = useCallback(() => {
    console.log('[Offline] Connection restored');
    setIsOffline(false);
  }, []);

  const handleOffline = useCallback(() => {
    console.log('[Offline] Connection lost');
    setIsOffline(true);
  }, []);

  useEffect(() => {
    // Set initial state
    const initialOfflineState = !navigator.onLine;
    console.log(`[Offline] Initial state: ${initialOfflineState ? 'offline' : 'online'}`);
    setIsOffline(initialOfflineState);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  const queueRequest = useCallback(<T,>(endpoint: string, options: RequestInit): Promise<T> => {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        endpoint,
        options,
        resolve,
        reject,
        timestamp: Date.now(),
      };
      console.log(`[Offline] Queued request to ${endpoint}`);
      setQueuedRequests(prev => [...prev, request]);
    });
  }, []);

  const retryQueuedRequests = useCallback(async () => {
    if (!navigator.onLine) {
      console.log('[Offline] Still offline, skipping retry');
      return;
    }

    const requests = [...queuedRequests];
    console.log(`[Offline] Retrying ${requests.length} queued requests`);
    setQueuedRequests([]);

    for (const request of requests) {
      try {
        console.log(`[Offline] Retrying request to ${request.endpoint}`);
        const response = await fetch(request.endpoint, request.options);
        const data = await response.json();
        request.resolve(data);
        console.log(`[Offline] Successfully retried request to ${request.endpoint}`);
      } catch (error) {
        console.error(`[Offline] Failed to retry request to ${request.endpoint}:`, error);
        request.reject(error);
      }
    }
  }, [queuedRequests]);

  // Retry queued requests when coming back online
  useEffect(() => {
    if (navigator.onLine && queuedRequests.length > 0) {
      console.log(`[Offline] Connection restored, retrying ${queuedRequests.length} requests`);
      retryQueuedRequests();
    }
  }, [isOffline, queuedRequests.length, retryQueuedRequests]);

  // Set the offline context for the API client
  useEffect(() => {
    setOfflineContext({
      isOffline,
      queueRequest,
    });
  }, [isOffline, queueRequest]);

  const value = {
    isOffline,
    queuedRequests,
    queueRequest,
    retryQueuedRequests,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
} 
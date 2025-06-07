'use client';

import { useOffline } from '@/lib/OfflineContext';

export function OfflineBanner() {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <div className="bg-yellow-500 text-white p-2 text-center">
      You are currently offline. Some features may be limited.
    </div>
  );
} 
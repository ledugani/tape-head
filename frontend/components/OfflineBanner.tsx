'use client';

import { useOffline } from '@/lib/OfflineContext';

export function OfflineBanner() {
  const { isOffline, queuedRequests } = useOffline();

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white p-4 flex items-center justify-center gap-2 shadow-lg z-50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>
        You are offline
        {queuedRequests.length > 0 && ` (${queuedRequests.length} requests queued)`}
      </span>
      <span className="text-sm opacity-75">
        {queuedRequests.length > 0 ? 'Requests will be sent when you are back online' : 'Your changes will be saved when you are back online'}
      </span>
    </div>
  );
} 
'use client';

import { useAuth } from '@/lib/AuthContext';

export function SessionWarning() {
  const { sessionExpiry } = useAuth();

  if (!sessionExpiry) return null;

  const timeUntilExpiry = sessionExpiry - Date.now();
  const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));

  if (minutesUntilExpiry > 5) return null;

  return (
    <div className="bg-red-500 text-white p-2 text-center">
      Your session will expire in {minutesUntilExpiry} minutes. Please save your work.
    </div>
  );
} 
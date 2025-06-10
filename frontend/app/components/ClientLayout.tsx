'use client';

import React from 'react';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { SessionWarning } from '@/src/components/SessionWarning';
import { useAuth } from '@/lib/AuthContext';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { hasSessionConflict, resolveSessionConflict, dismissSessionConflict } = useAuth();

  return (
    <>
      {children}
      <OfflineBanner />
      {hasSessionConflict && <SessionWarning />}
    </>
  );
} 
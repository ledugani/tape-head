'use client';

import React from 'react';
import { OfflineBanner } from '@/components/OfflineBanner';
import { SessionWarning } from '@/components/SessionWarning';
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
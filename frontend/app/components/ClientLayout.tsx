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
      {hasSessionConflict && (
        <SessionWarning
          message="You are logged in on another device. Would you like to log out other sessions?"
          onConfirm={resolveSessionConflict}
          onDismiss={dismissSessionConflict}
        />
      )}
    </>
  );
} 
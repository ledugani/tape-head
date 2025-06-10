'use client';

import React from 'react';
import { OfflineBanner } from '@/components/OfflineBanner';
import { SessionWarning } from '@/components/SessionWarning';
import { useAuth } from '@/lib/AuthContext';
import { Navbar } from './Navbar';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { hasSessionConflict, resolveSessionConflict, dismissSessionConflict } = useAuth();

  return (
    <>
      <Navbar />
      {children}
      <OfflineBanner />
      {hasSessionConflict && <SessionWarning />}
    </>
  );
} 
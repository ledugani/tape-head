'use client';

import React from 'react';
import { AuthProvider } from '@/lib/AuthContext';
import { OfflineProvider } from '@/lib/OfflineContext';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <OfflineProvider>
            {children}
          </OfflineProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 
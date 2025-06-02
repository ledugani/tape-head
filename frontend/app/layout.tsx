'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { OfflineProvider } from '@/lib/OfflineContext';
import { OfflineBanner } from '@/components/OfflineBanner';
import { SessionWarning } from '@/components/SessionWarning';
import { useAuth } from '@/lib/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tape Head',
  description: 'Your music collection, organized.',
};

function LayoutContent({ children }: { children: React.ReactNode }) {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OfflineProvider>
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </OfflineProvider>
      </body>
    </html>
  );
}

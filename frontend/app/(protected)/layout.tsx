'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  console.log('ProtectedLayout: Rendering with state:', { isAuthenticated, isLoading });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedLayout: Not authenticated, redirecting to /login');
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    console.log('ProtectedLayout: Loading state, showing spinner');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" data-testid="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedLayout: Not authenticated, showing loading spinner while redirecting');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" data-testid="loading-spinner"></div>
      </div>
    );
  }

  console.log('ProtectedLayout: Authenticated, rendering children');
  return <>{children}</>;
} 
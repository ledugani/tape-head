'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  console.log('ProtectedLayout render:', { isAuthenticated, isLoading });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedLayout: Not authenticated, redirecting to login');
      router.replace('/login?from=/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    console.log('ProtectedLayout: Loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedLayout: Not authenticated');
    return null;
  }

  console.log('ProtectedLayout: Rendering protected content');
  return <>{children}</>;
} 
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('ProtectedRoute state:', { isAuthenticated, isLoading, pathname });
    if (!isLoading && !isAuthenticated) {
      // Store the attempted URL to redirect back after login
      const returnUrl = encodeURIComponent(pathname);
      console.log('Not authenticated, redirecting to login with return URL:', returnUrl);
      router.replace(`/login?from=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute: Loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, don't render the protected content
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated');
    return null;
  }

  // If authenticated, render the protected content
  console.log('ProtectedRoute: Rendering protected content');
  return <>{children}</>;
} 
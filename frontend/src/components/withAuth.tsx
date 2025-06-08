'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        // Store the attempted URL to redirect back after login
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/login?from=${returnUrl}`);
      }
    }, [isLoading, isAuthenticated, router, pathname]);

    // Show loading state while checking authentication
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    // If not authenticated, don't render the protected component
    if (!isAuthenticated) {
      return null;
    }

    // If authenticated, render the protected component
    return <WrappedComponent {...props} />;
  };
} 
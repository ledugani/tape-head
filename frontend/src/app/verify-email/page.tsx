'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          throw new Error('Verification token is missing');
        }

        await fetchApi('/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError('Failed to verify email. The link may have expired or is invalid.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Verifying Email</h1>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-4">
              <Link 
                href="/login" 
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
              >
                Return to Login
              </Link>
              <Link 
                href="/" 
                className="block w-full text-center text-blue-600 hover:text-blue-500"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-4">Email Verified</h1>
          <p className="text-gray-600 mb-6">Your email has been successfully verified.</p>
          <div className="space-y-4">
            {user ? (
              <Link 
                href="/dashboard" 
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
              >
                Log In
              </Link>
            )}
            <Link 
              href="/" 
              className="block w-full text-center text-blue-600 hover:text-blue-500"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
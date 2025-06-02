'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    setError('');

    try {
      await fetchApi('/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });
      setSuccess(true);
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      if (err.message.includes('invalid_token')) {
        setError('Invalid or expired verification link. Please request a new verification email.');
      } else if (err.message.includes('already_verified')) {
        setError('Email is already verified. You can now log in.');
      } else {
        setError('An error occurred during verification. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerification = async () => {
    setError('');
    setResendDisabled(true);
    setCountdown(60); // 60 seconds cooldown

    try {
      await fetchApi('/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user?.email }),
      });
      setSuccess(true);
    } catch (err: any) {
      if (err.message.includes('rate_limit')) {
        setError('Too many attempts. Please wait before requesting another verification email.');
      } else {
        setError('Failed to send verification email. Please try again.');
      }
    }
  };

  if (success && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Email verified successfully
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your email has been verified. You will be redirected to the dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please check your email for a verification link. If you haven't received it, you can request a new one.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {success && !token && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Verification email sent
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Please check your email for the verification link. If it doesn't appear within a few minutes, check your spam folder.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={resendVerification}
            disabled={resendDisabled || isVerifying}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : resendDisabled ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend verification email'
            )}
          </button>

          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
} 
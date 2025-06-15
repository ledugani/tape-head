'use client';

import React from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">Password reset functionality coming soon</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded relative mb-6" role="alert">
          <p className="text-center">
            We're working on bringing you a secure password reset feature. Please check back soon.
          </p>
        </div>

        <div className="text-center">
          <Link 
            href="/login" 
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
} 
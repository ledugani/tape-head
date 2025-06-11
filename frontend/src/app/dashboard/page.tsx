'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { CollectionView } from '@/app/components/CollectionView';
import { WantlistView } from '@/app/components/WantlistView';

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return null; // Auth middleware will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex space-x-4">
            <Link
              href="/dashboard/collection"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Collection
            </Link>
            <Link
              href="/dashboard/wantlist"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Wantlist
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6">
            {/* Collection Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Collection</h2>
                <Link
                  href="/dashboard/collection"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all →
                </Link>
              </div>
              <CollectionView />
            </div>

            {/* Wantlist Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Wantlist</h2>
                <Link
                  href="/dashboard/wantlist"
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  View all →
                </Link>
              </div>
              <WantlistView />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
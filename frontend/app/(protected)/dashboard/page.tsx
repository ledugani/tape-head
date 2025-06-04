'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import Link from 'next/link';
import { CollectionView } from '@/app/components/CollectionView';
import { WantlistView } from '../../../app/components/WantlistView';
import { getUserCollection, getUserWantlist } from '@/lib/api';
import type { VHSTape } from '@/types/record';

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [recentTapes, setRecentTapes] = useState<VHSTape[]>([]);
  const [recentWantlist, setRecentWantlist] = useState<VHSTape[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        // Fetch recent collection items
        const collectionData = await getUserCollection();
        setRecentTapes(collectionData);

        // Fetch recent wantlist items
        const wantlistData = await getUserWantlist();
        setRecentWantlist(wantlistData);
      } catch (error) {
        console.error('Error fetching recent items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchRecentItems();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
            <p className="mt-2 text-gray-600">Here's an overview of your collection and wantlist.</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/collection/add"
            className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add to Collection
          </Link>
          <Link
            href="/wantlist/add"
            className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Add to Wantlist
          </Link>
          <Link
            href="/collection"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View Collection
          </Link>
          <Link
            href="/wantlist"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View Wantlist
          </Link>
        </div>

        {/* Recent Collection */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Collection</h2>
            <Link
              href="/collection"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all →
            </Link>
          </div>
          <CollectionView />
        </div>

        {/* Recent Wantlist */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Wantlist</h2>
            <Link
              href="/wantlist"
              className="text-sm font-medium text-green-600 hover:text-green-500"
            >
              View all →
            </Link>
          </div>
          <WantlistView items={recentWantlist} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
} 
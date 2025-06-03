'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

interface CollectionStats {
  totalTapes: number;
  recentAdditions: number;
  byCondition: Record<string, number>;
}

interface WantlistStats {
  totalItems: number;
  highPriority: number;
  recentAdditions: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [collectionStats, setCollectionStats] = useState<CollectionStats | null>(null);
  const [wantlistStats, setWantlistStats] = useState<WantlistStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch collection stats
        const collectionResponse = await fetch('/api/collection/stats');
        const collectionData = await collectionResponse.json();
        setCollectionStats(collectionData);

        // Fetch wantlist stats
        const wantlistResponse = await fetch('/api/wantlist/stats');
        const wantlistData = await wantlistResponse.json();
        setWantlistStats(wantlistData);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Collection Stats */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Collection</h3>
              <div className="mt-4">
                <dl className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 px-4 py-3 rounded-md">
                    <dt className="text-sm font-medium text-gray-500">Total Tapes</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {collectionStats?.totalTapes || 0}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-md">
                    <dt className="text-sm font-medium text-gray-500">Recent Additions</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {collectionStats?.recentAdditions || 0}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Wantlist Stats */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Wantlist</h3>
              <div className="mt-4">
                <dl className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 px-4 py-3 rounded-md">
                    <dt className="text-sm font-medium text-gray-500">Total Items</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {wantlistStats?.totalItems || 0}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-md">
                    <dt className="text-sm font-medium text-gray-500">High Priority</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">
                      {wantlistStats?.highPriority || 0}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <div className="mt-4">
                <ul className="divide-y divide-gray-200">
                  {collectionStats?.recentAdditions ? (
                    <li className="py-3">
                      <p className="text-sm text-gray-600">
                        Added {collectionStats.recentAdditions} tapes to your collection
                      </p>
                    </li>
                  ) : null}
                  {wantlistStats?.recentAdditions ? (
                    <li className="py-3">
                      <p className="text-sm text-gray-600">
                        Added {wantlistStats.recentAdditions} items to your wantlist
                      </p>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
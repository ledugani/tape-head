'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { CollectionView } from '@/app/components/CollectionView';
import { WantlistView } from '@/app/components/WantlistView';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-red-600">Something went wrong: {error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="mt-4 text-blue-600 hover:text-blue-500"
      >
        Try again
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

function TabContent({ activeTab }: { activeTab: 'collection' | 'wantlist' }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {activeTab === 'collection' ? <CollectionView /> : <WantlistView />}
    </Suspense>
  );
}

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'collection' | 'wantlist'>('collection');
  const [error, setError] = useState<Error | null>(null);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorFallback error={error} resetErrorBoundary={() => setError(null)} />;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">You must be logged in to view this page.</p>
        <Link href="/login" className="mt-4 text-blue-600 hover:text-blue-500">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold mb-4" data-testid="dashboard-welcome">
          Welcome to your dashboard, {user.email}!
        </h1>
        <button 
          data-testid="logout-button" 
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
      
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('collection')}
              className={`${
                activeTab === 'collection'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Collection
            </button>
            <button
              onClick={() => setActiveTab('wantlist')}
              className={`${
                activeTab === 'wantlist'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Wantlist
            </button>
          </nav>
        </div>
      </div>

      <div data-testid={activeTab === 'collection' ? 'collection-list' : 'wantlist-list'}>
        <TabContent activeTab={activeTab} />
      </div>
    </div>
  );
} 
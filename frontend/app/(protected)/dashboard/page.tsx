'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { CollectionView } from '@/app/components/CollectionView';
import { WantlistView } from '@/app/components/WantlistView';
import { getUserCollection, getUserWantlist } from '@/lib/api';
import type { VHSTape } from '@/types/record';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'collection' | 'wantlist'>('collection');

  console.log('DashboardPage rendered, user:', user);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.username || 'User'}</h1>
        <button 
          data-testid="logout-button" 
          onClick={async () => await logout()}
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

      {activeTab === 'collection' ? (
        <CollectionView />
      ) : (
        <WantlistView />
      )}
    </div>
  );
} 
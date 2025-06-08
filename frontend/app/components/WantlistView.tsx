'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useWantlist } from '@/src/hooks/useWantlist';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-red-600">{error}</p>
      <button 
        onClick={onRetry} 
        className="mt-4 text-blue-600 hover:text-blue-500"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium text-gray-900">Your wantlist is empty</h3>
      <p className="mt-2 text-gray-600">Start building your wantlist by adding some items!</p>
      <div className="mt-6">
        <Link
          href="/wantlist/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          Add to Wantlist
        </Link>
      </div>
    </div>
  );
}

function WantlistContent() {
  const { items, isLoading, error, refetch } = useWantlist();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!items.length) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className="aspect-square relative">
            <img
              src={item.tape.coverImage}
              alt={item.tape.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 truncate">{item.tape.title}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Director:</span> {item.tape.director}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Year:</span> {item.tape.releaseYear}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WantlistView() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <WantlistContent />
    </Suspense>
  );
} 
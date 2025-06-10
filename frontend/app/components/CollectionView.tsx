'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useCollection } from '../../src/hooks/useCollection';
import Image from 'next/image';

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg animate-pulse">
          <div className="aspect-[2/3] bg-gray-300 rounded-t-lg" />
          <div className="p-4">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-300 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CollectionContent() {
  const { tapes, isLoading, error } = useCollection();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-500 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (tapes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Your collection is empty</p>
        <Link
          href="/tapes"
          className="text-blue-500 hover:underline"
        >
          Browse tapes
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tapes.map((tape) => (
        <Link
          key={tape.id}
          href={`/tapes/${tape.id}`}
          className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="aspect-[2/3] relative">
            <Image
              src={tape.coverImage || '/images/placeholder-vhs.svg'}
              alt={tape.title}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-1">{tape.title}</h2>
            <p className="text-gray-600 text-sm">{tape.year}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function CollectionView() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CollectionContent />
    </Suspense>
  );
} 
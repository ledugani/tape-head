'use client';

import React from 'react';
import Link from 'next/link';

interface Tape {
  id: number;
  title: string;
  condition: string;
  publisher: string;
  releaseYear: number;
}

interface CollectionViewProps {
  tapes: Tape[];
  isLoading?: boolean;
}

export function CollectionView({ tapes, isLoading = false }: CollectionViewProps) {
  if (isLoading) {
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

  if (!tapes.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No tapes in your collection yet</h3>
        <p className="mt-2 text-gray-600">Start building your collection by adding some tapes!</p>
        <div className="mt-6">
          <Link
            href="/collection/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add to Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tapes.map((tape) => (
        <div
          key={tape.id}
          className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 truncate">{tape.title}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Publisher:</span> {tape.publisher}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Year:</span> {tape.releaseYear}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Condition:</span>{' '}
                <span className="capitalize">{tape.condition}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 
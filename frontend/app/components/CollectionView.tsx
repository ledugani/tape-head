'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserCollection, Tape } from '@/lib/api';

export function CollectionView() {
  const [tapes, setTapes] = useState<Tape[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTapes = async () => {
      try {
        const data = await getUserCollection();
        setTapes(data);
      } catch (err) {
        setError('Failed to load collection');
        console.error('Error fetching collection:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTapes();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-blue-600 hover:text-blue-500"
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
          href="/collection/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Add your first tape
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tapes.map((tape) => (
        <div key={tape.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{tape.title}</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Publisher: {tape.publisher}</p>
            <p>Year: {tape.releaseYear}</p>
            <p>Condition: <span className="font-medium">{tape.condition}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
} 
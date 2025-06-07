'use client';

import React from 'react';
import Link from 'next/link';
import { useWantlist } from '@/hooks/useWantlist';

export function WantlistView() {
  const { items, isLoading, error } = useWantlist();

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

  if (!items.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No items in your wantlist yet</h3>
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
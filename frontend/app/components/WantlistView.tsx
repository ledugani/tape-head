'use client';

import React from 'react';
import Link from 'next/link';

interface WantlistItem {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  publisher: string;
  releaseYear: number;
}

interface WantlistViewProps {
  items: WantlistItem[];
  isLoading?: boolean;
}

export function WantlistView({ items, isLoading = false }: WantlistViewProps) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900 truncate">{item.title}</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                  item.priority
                )}`}
              >
                {item.priority}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Publisher:</span> {item.publisher}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Year:</span> {item.releaseYear}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 
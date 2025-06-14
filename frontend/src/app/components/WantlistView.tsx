'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { WantlistItem } from '@/types/api';
import Image from 'next/image';

export function WantlistView() {
  const [tapes, setTapes] = useState<WantlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWantlist = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/wantlist');
        if (response.data.success) {
          setTapes(response.data.data);
          setError(null);
        } else {
          setError(response.data.message || 'Failed to load wantlist');
        }
      } catch (err) {
        setError('Failed to load wantlist');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWantlist();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (tapes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your wantlist is empty</h3>
        <p className="text-gray-500">Start adding VHS tapes to your wantlist to see them here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tapes.map((tape) => (
        <div
          key={tape.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
          <div className="aspect-square relative">
            <Image
              src={tape.tape.coverImage || '/images/tape-placeholder.jpg'}
              alt={tape.tape.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/tape-placeholder.jpg';
              }}
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 truncate">{tape.tape.title}</h3>
            <p className="text-sm text-gray-500 truncate">{tape.tape.label}</p>
            <p className="text-sm text-gray-500 mt-1">{tape.tape.year}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 
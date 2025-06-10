'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Tape } from '@/src/lib/api';
import { mockTapes } from '@/src/lib/api';

export default function TapeDetailPage({ params }: { params: { id: string } }) {
  const [tape, setTape] = useState<Tape | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTape = async () => {
      try {
        setIsLoading(true);
        // In development, use mock data
        const foundTape = mockTapes.find(t => t.id === params.id);
        if (!foundTape) {
          throw new Error('Tape not found');
        }
        setTape(foundTape);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tape details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTape();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image Skeleton */}
          <div className="md:w-1/3">
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto">
              <div className="w-full h-full bg-gray-200 rounded-lg shadow-lg animate-pulse" />
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="md:w-2/3">
            {/* Title Skeleton */}
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6 animate-pulse" />

            <div className="space-y-6">
              {/* Details Section Skeleton */}
              <div>
                <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description Section Skeleton */}
              <div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
                </div>
              </div>

              {/* Additional Information Section Skeleton */}
              <div>
                <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!tape) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tape Not Found</h2>
          <p className="text-gray-600">The tape you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover Image */}
        <div className="md:w-1/3">
          <div className="relative aspect-[3/4] w-full max-w-sm mx-auto">
            <Image
              src={tape.coverImage}
              alt={tape.title}
              fill
              className="object-cover rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>

        {/* Tape Details */}
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{tape.title}</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Details</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Release Year</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tape.releaseYear}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Genre</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tape.genre}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Label</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tape.label}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Format</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tape.format}</dd>
                </div>
              </dl>
            </div>

            {tape.notes && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-600">{tape.notes}</p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-2">Additional Information</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Added</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(tape.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(tape.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useEffect, useState } from 'react';
import { getTape } from '@/api/client';
import type { Tape } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';

// Fallback image for when the cover image fails to load
const FALLBACK_IMAGE = '/images/placeholder-vhs.svg';

export default function TapePage({ params }: { params: { id: string } }) {
  const [tape, setTape] = useState<Tape | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchTape = async () => {
      try {
        setIsLoading(true);
        const data = await getTape(params.id.toString());
        setTape(data);
        setError(null);
      } catch (err) {
        setError('Failed to load tape details');
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
          <div className="md:w-1/3 flex justify-center">
            <div className="relative w-[256px] h-[352px] bg-white dark:bg-neutral-900 rounded-lg shadow-md">
              <div className="absolute inset-0.5 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="md:w-2/3">
            {/* Title Skeleton */}
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6 animate-pulse" />

            <div className="space-y-4">
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
      <Link href="/tapes" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
        ← Back to all tapes
      </Link>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover Image */}
        <div className="md:w-1/3 flex justify-center">
          <div className="relative w-[256px] h-[352px] bg-white dark:bg-neutral-900 rounded-lg shadow-md">
            <div className="absolute inset-0.5 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
              <Image
                src={imageError ? FALLBACK_IMAGE : tape.coverImage}
                alt={`${tape.title} VHS cover`}
                fill
                className="object-contain p-1"
                priority
                onError={() => setImageError(true)}
                unoptimized={imageError} // Skip Next.js image optimization for fallback
              />
            </div>
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
                  <dd className="mt-1 text-sm text-gray-900">{tape.year}</dd>
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

            {/* Publisher Information */}
            {tape.publisher && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Publisher</h2>
                <Link 
                  href={`/publishers/${tape.publisher.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>{tape.publisher.name}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}

            {/* Box Set Information */}
            {tape.boxSet && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Part of Box Set</h2>
                <Link 
                  href={`/box-sets/${tape.boxSet.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>{tape.boxSet.title}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                {tape.boxSet.year && (
                  <p className="mt-1 text-sm text-gray-600">Released: {tape.boxSet.year}</p>
                )}
              </div>
            )}

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

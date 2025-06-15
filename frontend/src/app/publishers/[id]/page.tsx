'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPublisher } from '@/api/client';
import type { Publisher } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';

export default function PublisherPage() {
  const { id: slug } = useParams();
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublisher = async () => {
      try {
        const data = await getPublisher(slug as string);
        setPublisher(data);
      } catch (err) {
        setError('Failed to load publisher');
      } finally {
        setLoading(false);
      }
    };

    fetchPublisher();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Logo Skeleton */}
          <div className="md:w-1/3">
            <div className="relative aspect-square w-full max-w-sm mx-auto">
              <div className="w-full h-full bg-gray-200 rounded-lg shadow-lg animate-pulse" />
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="md:w-2/3">
            {/* Title Skeleton */}
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6 animate-pulse" />
            
            {/* Description Skeleton */}
            <div className="space-y-2 mb-8">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            </div>

            {/* Tapes Grid Skeleton */}
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="relative aspect-[3/4] mb-2">
                    <div className="w-full h-full bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
              ))}
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
          <Link 
            href="/publishers" 
            className="mt-4 inline-block text-blue-600 hover:text-blue-500"
          >
            Return to Publishers
          </Link>
        </div>
      </div>
    );
  }

  if (!publisher) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Publisher Not Found</h2>
          <p className="text-gray-600">The publisher you're looking for doesn't exist.</p>
          <Link 
            href="/publishers" 
            className="mt-4 inline-block text-blue-600 hover:text-blue-500"
          >
            Return to Publishers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="relative w-full aspect-square mb-4">
            <Image
              src={publisher.logoImage || '/images/placeholder-vhs.svg'}
              alt={publisher.name}
              fill
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-vhs.svg';
              }}
            />
          </div>
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{publisher.name}</h1>
          <p className="text-gray-600 mb-8">{publisher.description}</p>
          
          <h2 className="text-2xl font-semibold mb-4">VHS Releases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publisher.tapes.map((tape) => (
              <Link 
                href={`/tapes/${tape.id}`} 
                key={tape.id}
                className="block hover:opacity-90 transition-opacity"
              >
                <div className="relative aspect-[3/4] mb-2">
                  <Image
                    src={tape.coverImage || '/images/placeholder-vhs.svg'}
                    alt={tape.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-vhs.svg';
                    }}
                  />
                </div>
                <h3 className="font-medium">{tape.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
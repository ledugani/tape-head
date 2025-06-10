'use client';

import React, { useEffect, useState } from 'react';
import { getTapes } from '@/src/api/client';
import type { Tape } from '@/src/types/api';
import Link from 'next/link';
import Image from 'next/image';

// Fallback image for when the cover image fails to load
const FALLBACK_IMAGE = '/images/placeholder-vhs.svg';

export default function TapesPage() {
  const [tapes, setTapes] = useState<Tape[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchTapes = async () => {
      try {
        setIsLoading(true);
        const data = await getTapes();
        setTapes(data);
        setError(null);
      } catch (err) {
        setError('Failed to load tapes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTapes();
  }, []);

  const handleImageError = (tapeId: number) => {
    setImageErrors(prev => ({ ...prev, [tapeId]: true }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tapes found</h3>
        <p className="text-gray-500">There are no tapes in the database yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All VHS Tapes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tapes.map((tape) => (
          <Link 
            href={`/tapes/${tape.id}`} 
            key={tape.id}
            className="block hover:opacity-90 transition-opacity"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src={imageErrors[Number(tape.id)] ? FALLBACK_IMAGE : tape.coverImage}
                  alt={tape.title}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(Number(tape.id))}
                  unoptimized={imageErrors[Number(tape.id)]}
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{tape.title}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Year:</span> {tape.year}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Genre:</span> {tape.genre}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Label:</span> {tape.label}
                  </p>
                  {tape.publisher && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Publisher:</span> {tape.publisher.name}
                    </p>
                  )}
                  {tape.boxSet && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Box Set:</span> {tape.boxSet.title}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 
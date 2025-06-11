'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTape } from '@/api/client';
import type { Tape } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';

export default function TapePage() {
  const { id } = useParams();
  const [tape, setTape] = useState<Tape | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTape = async () => {
      try {
        const data = await getTape(id as string);
        setTape(data);
      } catch (err) {
        setError('Failed to load tape');
      } finally {
        setLoading(false);
      }
    };

    fetchTape();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!tape) return <div>Tape not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="relative w-full aspect-square mb-4">
            <Image
              src={tape.coverImage || '/images/placeholder-vhs.svg'}
              alt={tape.title}
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{tape.title}</h1>
          {tape.year && <p className="text-gray-600 mb-2">Released: {tape.year}</p>}
          {tape.label && <p className="text-gray-600 mb-2">Label: {tape.label}</p>}
          {tape.genre && <p className="text-gray-600 mb-2">Genre: {tape.genre}</p>}
          {tape.format && <p className="text-gray-600 mb-2">Format: {tape.format}</p>}
          
          {tape.boxSet && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Part of Box Set</h2>
              <Link 
                href={`/boxsets/${tape.boxSet.id}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <span>{tape.boxSet.title}</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {tape.publisher && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Publisher</h2>
              <Link
                href={`/publishers/${tape.publisher.slug}`}
                className="text-blue-600 hover:text-blue-800"
              >
                {tape.publisher.name}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
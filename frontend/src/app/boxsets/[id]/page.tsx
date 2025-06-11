'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBoxSet } from '@/api/client';
import type { BoxSet } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';

export default function BoxSetPage() {
  const { id } = useParams();
  const [boxSet, setBoxSet] = useState<BoxSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchBoxSet = async () => {
      try {
        if (!id || typeof id !== 'string') {
          throw new Error('Invalid box set ID');
        }
        const data = await getBoxSet(id);
        setBoxSet(data);
      } catch (err) {
        setError('Failed to load box set');
        console.error('Error loading box set:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxSet();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!boxSet) return <div>Box set not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="relative w-full aspect-square mb-4">
            <Image
              src={imageError ? '/images/placeholder-vhs.svg' : (boxSet.coverImage || '/images/placeholder-vhs.svg')}
              alt={boxSet.title}
              fill
              className="object-contain"
              priority
              onError={() => setImageError(true)}
            />
          </div>
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{boxSet.title}</h1>
          {boxSet.year && <p className="text-gray-600 mb-2">Released: {boxSet.year}</p>}
          {boxSet.label && <p className="text-gray-600 mb-2">Label: {boxSet.label}</p>}
          {boxSet.description && (
            <p className="text-gray-600 mb-8">{boxSet.description}</p>
          )}
          
          <h2 className="text-2xl font-semibold mb-4">VHS Tapes in this Set</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boxSet.tapes.map((tape) => (
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
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-vhs.svg';
                    }}
                  />
                </div>
                <h3 className="font-medium">{tape.title}</h3>
                {tape.year && <p className="text-gray-600">{tape.year}</p>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
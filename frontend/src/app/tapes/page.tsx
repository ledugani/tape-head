'use client';

import { useEffect, useState } from 'react';
import { getTapes } from '@/api/client';
import type { Tape } from '@/types/api';
import Link from 'next/link';
import Image from 'next/image';

export default function TapesPage() {
  const [tapes, setTapes] = useState<Tape[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTapes = async () => {
      try {
        const data = await getTapes();
        setTapes(data);
      } catch (err) {
        setError('Failed to load tapes');
        console.error('Error fetching tapes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTapes();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">VHS Tapes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tapes.map((tape) => (
          <Link
            key={tape.id}
            href={`/tapes/${tape.id}`}
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
            <h2 className="font-medium">{tape.title}</h2>
            {tape.year && <p className="text-gray-600">{tape.year}</p>}
            {tape.label && <p className="text-gray-600">{tape.label}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
} 
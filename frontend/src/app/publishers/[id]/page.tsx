'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPublisher } from '@/api/client';
import type { Publisher } from '@/types/api';
import Image from 'next/image';
import Link from 'next/link';

export default function PublisherPage() {
  const { id } = useParams();
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublisher = async () => {
      try {
        const data = await getPublisher(id as string);
        setPublisher(data);
      } catch (err) {
        setError('Failed to load publisher');
      } finally {
        setLoading(false);
      }
    };

    fetchPublisher();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!publisher) return <div>Publisher not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="relative w-full aspect-square mb-4">
            <Image
              src={publisher.logoImage}
              alt={publisher.name}
              fill
              className="object-contain"
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
                    src={tape.coverImage}
                    alt={tape.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-medium">{tape.title}</h3>
                <p className="text-gray-600">${tape.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
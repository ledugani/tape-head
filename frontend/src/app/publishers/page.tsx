'use client';

import { useEffect, useState } from 'react';
import { getPublishers } from '@/api/client';
import { Publisher } from '@/types/api';
import Link from 'next/link';
import Image from 'next/image';

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const data = await getPublishers();
        setPublishers(data);
      } catch (err) {
        setError('Failed to load publishers');
      } finally {
        setLoading(false);
      }
    };

    fetchPublishers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Publishers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishers.map((publisher) => (
          <Link
            key={publisher.id}
            href={`/publishers/${publisher.id}`}
            className="block hover:opacity-90 transition-opacity"
          >
            <div className="relative aspect-[3/4] mb-2">
              <Image
                src={publisher.logoImage}
                alt={publisher.name}
                fill
                className="object-contain"
              />
            </div>
            <h2 className="font-medium">{publisher.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
} 
import React from 'react';
import { getPublisher } from '@/api/client';
import { Publisher } from '@/types/api';
import Link from 'next/link';
import Image from 'next/image';

interface PublisherPageProps {
  params: {
    slug: string;
  };
}

export default async function PublisherPage({ params }: PublisherPageProps) {
  let publisher: Publisher | null = null;
  let error: string | null = null;

  try {
    publisher = await getPublisher(params.slug);
  } catch (err) {
    console.error('Error in PublisherPage:', err);
    error = err instanceof Error ? err.message : 'Failed to load publisher';
  }

  if (error || !publisher) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Error Loading Publisher</h1>
        <p className="text-red-500 mb-4">{error || 'The publisher you\'re looking for doesn\'t exist.'}</p>
        <Link href="/publishers" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Publishers
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{publisher.name}</h1>
        {publisher.description && (
          <p className="text-gray-600 mb-4">{publisher.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publisher.tapes.map((tape) => (
          <Link
            key={tape.id}
            href={`/tapes/${tape.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="aspect-[2/3] relative">
              <Image
                src={tape.coverImage || '/images/placeholder-vhs.svg'}
                alt={tape.title}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-1">{tape.title}</h2>
              <p className="text-gray-600 text-sm">{tape.year}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 
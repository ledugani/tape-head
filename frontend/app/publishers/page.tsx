import React from 'react';
import { getPublishers } from '@/src/api/client';
import { Publisher } from '@/src/types/api';
import Link from 'next/link';

export default async function PublishersPage() {
  const publishers = await getPublishers();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Publishers</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishers.map((publisher) => (
          <Link
            key={publisher.id}
            href={`/publishers/${publisher.slug}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <h2 className="text-xl font-semibold mb-2">{publisher.name}</h2>
            {publisher.description && (
              <p className="text-gray-600 mb-4">{publisher.description}</p>
            )}
            <p className="text-sm text-gray-500">
              {publisher.tapes.length} {publisher.tapes.length === 1 ? 'tape' : 'tapes'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
} 
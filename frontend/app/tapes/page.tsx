'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { mockTapes } from '@/src/lib/api';

export default function TapesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">VHS Tapes</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockTapes.map((tape) => (
          <Link 
            href={`/tapes/${tape.id}`} 
            key={tape.id}
            className="block hover:opacity-90 transition-opacity"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src={tape.coverImage}
                  alt={tape.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{tape.title}</h3>
                <p className="text-sm text-gray-500">{tape.releaseYear}</p>
                <p className="text-sm text-gray-500">{tape.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 
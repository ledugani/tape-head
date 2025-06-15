'use client';

import { useEffect, useState, useCallback } from 'react';
import { getTapes } from '@/api/client';
import type { Tape } from '@/types/api';
import Link from 'next/link';
import Image from 'next/image';
import debounce from 'lodash/debounce';

export default function TapesPage() {
  const [tapes, setTapes] = useState<Tape[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchTapes = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTapes(search);
      setTapes(data);
    } catch (err) {
      setError('Failed to load tapes');
      console.error('Error fetching tapes:', err);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTapes();
  }, [fetchTapes]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setIsSearching(true);
      fetchTapes(query);
    }, 300),
    [fetchTapes]
  );

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      debouncedSearch.cancel();
      fetchTapes();
    }
  };

  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-red-600 bg-red-50 p-4 rounded-md">
        {error}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">VHS Tapes</h1>
      
      <div className="mb-8">
        <label htmlFor="tape-search" className="sr-only">
          Search tapes
        </label>
        <div className="relative">
          <input
            type="search"
            id="tape-search"
            name="tape-search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search tapes..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search tapes"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isSearching ? (
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="relative aspect-[3/4] mb-2 bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
} 
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/tape-head_logo.svg"
                alt="TAPE HEAD logo"
                width={48}
                height={48}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 
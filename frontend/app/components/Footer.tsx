'use client';

import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-600">
          <p>© {currentYear} TAPE HEAD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 
'use client';

import React from 'react';

export default function TapeDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Cover Image Placeholder */}
        <div className="aspect-[3/4] w-64 mx-auto bg-gray-200 rounded-lg mb-6" />
        
        {/* Title Placeholder */}
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4" />
        
        {/* Details Placeholders */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
} 
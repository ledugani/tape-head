'use client';

import { getTapes } from '@/api/client';
import type { Tape } from '@/types/api';

export default function TapesPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-900">Tapes</h1>
    </div>
  );
} 
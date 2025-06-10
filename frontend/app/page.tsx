import React from 'react';
import { Button } from '@/components/Button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Welcome to Tape Head</h1>
        <div className="flex flex-col items-center space-y-4">
          <Button href="/tapes" size="lg">
            Browse Tapes
          </Button>
          <Button href="/publishers" variant="secondary" size="lg">
            View Publishers
          </Button>
        </div>
      </div>
    </main>
  );
} 
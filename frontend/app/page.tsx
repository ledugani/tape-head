import React from 'react';
import { Button } from '@/components/Button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-blue-50">
      <h1 className="text-4xl font-bold text-blue-700">Hello VHS World</h1>
      <Button variant="default">Click me</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Outline</Button>
    </main>
  );
} 
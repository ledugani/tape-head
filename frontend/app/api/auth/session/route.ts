import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('Session API: Checking session...');
  const token = request.cookies.get('auth-token');
  console.log('Session API: Token from cookies:', token);

  if (!token?.value) {
    console.log('Session API: No token found');
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // In a real app, you would validate the token here
  // For now, we'll just check if it starts with 'mock-token-'
  if (!token.value.startsWith('mock-token-')) {
    console.log('Session API: Invalid token format');
    return NextResponse.json({ user: null }, { status: 401 });
  }

  console.log('Session API: Valid token found, returning user data');
  // Return mock user data
  return NextResponse.json({
    user: {
      id: '1',
      email: 'test@example.com',
      emailVerified: true,
      name: 'Test User'
    }
  });
} 
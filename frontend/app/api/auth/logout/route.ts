import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
  return response;
} 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login' || path === '/signup';
  const token = request.cookies.get('auth-token');

  // Debug logging
  console.log('Middleware: Request details:', {
    path,
    isPublicPath,
    hasToken: !!token?.value,
    tokenValue: token?.value,
    cookies: Array.from(request.cookies.getAll())
  });

  // If on a public path and has token, redirect to dashboard
  if (isPublicPath && token?.value) {
    console.log('Middleware: Redirecting to dashboard (public path with token)');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If on a protected path and no token, redirect to login
  if (!isPublicPath && !token?.value) {
    console.log('Middleware: Redirecting to login (protected path without token)');
    const url = new URL('/login', request.url);
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }

  console.log('Middleware: Allowing request to proceed');
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
}; 
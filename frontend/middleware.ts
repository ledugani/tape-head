import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  try {
    // Get all cookies for debugging
    const cookies = request.cookies.getAll();
    console.log('Middleware cookies:', cookies);

    // Check for token and its expiry
    const token = request.cookies.get('token')?.value;
    const tokenExpiry = request.cookies.get('token_expiry')?.value;
    
    const isTokenValid = token && tokenExpiry && parseInt(tokenExpiry) > Date.now();
    console.log('Middleware token check:', { 
      hasToken: !!token, 
      hasExpiry: !!tokenExpiry,
      isTokenValid,
      currentTime: Date.now(),
      expiryTime: tokenExpiry ? parseInt(tokenExpiry) : null
    });

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/signup') ||
                      request.nextUrl.pathname.startsWith('/forgot-password') ||
                      request.nextUrl.pathname.startsWith('/reset-password') ||
                      request.nextUrl.pathname.startsWith('/verify-email');

    console.log('Middleware:', {
      path: request.nextUrl.pathname,
      hasToken: !!token,
      isTokenValid,
      isAuthPage,
      cookies: cookies.map(c => c.name)
    });

    // If trying to access auth pages while logged in, redirect to dashboard
    if (isAuthPage && isTokenValid) {
      console.log('Middleware: Redirecting to dashboard (logged in user on auth page)');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If trying to access protected pages while logged out or with invalid token, redirect to login
    if (!isAuthPage && !isTokenValid) {
      const from = encodeURIComponent(request.nextUrl.pathname);
      console.log('Middleware: Redirecting to login (no valid token)');
      return NextResponse.redirect(new URL(`/login?from=${from}`, request.url));
    }

    console.log('Middleware: Allowing request to proceed');
    return NextResponse.next();
  } catch (err) {
    console.error('Middleware error:', err);
    // On error, redirect to login to be safe
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ],
}; 
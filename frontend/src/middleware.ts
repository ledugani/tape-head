import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Normalize path by removing trailing slash (except root)
const normalizePath = (path: string) =>
  path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

// Define public routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/signup', '/verify-email'];
const NORMALIZED_PUBLIC_PATHS = PUBLIC_PATHS.map(normalizePath);

// Define protected routes that require authentication
const PROTECTED_PATHS = ['/dashboard'];
const NORMALIZED_PROTECTED_PATHS = PROTECTED_PATHS.map(normalizePath);

// Helper to check if token is valid
function isTokenValid(token: string | undefined, expiry: string | undefined): boolean {
  if (!token || !expiry) return false;
  
  const expiryTime = parseInt(expiry, 10);
  const isValid = expiryTime > Date.now();
  
  console.debug('[Middleware] Token check:', {
    hasToken: !!token,
    expiry: new Date(expiryTime).toISOString(),
    isValid
  });
  
  return isValid;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const tokenExpiry = request.cookies.get('token_expiry')?.value;

  // Normalize pathname for matching
  const normalizedPath = normalizePath(pathname);

  // Debug logging
  console.debug('Middleware Debug:', {
    pathname,
    normalizedPath,
    hasToken: !!token,
    hasExpiry: !!tokenExpiry,
    isPublicPath: NORMALIZED_PUBLIC_PATHS.includes(normalizedPath),
    isProtectedPath: NORMALIZED_PROTECTED_PATHS.includes(normalizedPath)
  });

  // Skip middleware for static files, API routes, and the root path
  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    console.debug('[Middleware] Skipping middleware for:', pathname);
    return NextResponse.next();
  }

  const isAuthenticated = isTokenValid(token, tokenExpiry);

  // If user is not authenticated and tries to access a protected route, redirect to login
  if (!isAuthenticated && NORMALIZED_PROTECTED_PATHS.includes(normalizedPath)) {
    console.debug('[Middleware] Redirecting unauthenticated user to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user has a valid token and tries to access a public page, redirect to dashboard
  if (isAuthenticated && NORMALIZED_PUBLIC_PATHS.includes(normalizedPath)) {
    console.debug('[Middleware] Redirecting authenticated user from public path to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For all other cases, let the request proceed
  console.debug('[Middleware] Allowing request to proceed');
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

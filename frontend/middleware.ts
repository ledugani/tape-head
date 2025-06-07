import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token');
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  // Debug logging
  console.log('Middleware:', {
    path,
    hasToken: !!authToken,
    isTokenValid: authToken?.value?.startsWith('mock-token-'),
    isPublicRoute,
    cookies: Array.from(request.cookies.getAll()).map(c => c.name)
  });

  // Check if we have a valid token
  const hasValidToken = authToken?.value?.startsWith('mock-token-');

  // If we have an invalid token, clear it and redirect to login
  if (authToken && !hasValidToken) {
    console.log('Middleware: Invalid token found, clearing and redirecting to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  // If we're on a public route and have a valid token, redirect to dashboard
  if (isPublicRoute && hasValidToken) {
    console.log('Middleware: Redirecting to dashboard (already authenticated)');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If we're not on a public route and don't have a valid token, redirect to login
  if (!isPublicRoute && !hasValidToken) {
    console.log('Middleware: Redirecting to login (no valid token)');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
  console.log('Middleware: Allowing request to proceed');
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 
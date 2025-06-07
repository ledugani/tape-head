import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('[Refresh API] Starting token refresh request');
  try {
    const { refreshToken } = await request.json();
    console.log('[Refresh API] Received refresh token:', !!refreshToken);

    if (!refreshToken) {
      console.log('[Refresh API] No refresh token provided');
      return NextResponse.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Mock token refresh - in a real app, this would validate the refresh token
    if (refreshToken.startsWith('mock-refresh-token-')) {
      console.log('[Refresh API] Valid refresh token, generating new tokens');
      const accessToken = `mock-access-token-${Date.now()}`;
      const newRefreshToken = `mock-refresh-token-${Date.now()}`;
      const expiresIn = 60 * 60 * 24 * 7; // 7 days

      const response = NextResponse.json({
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn
      });

      // Set cookies
      response.cookies.set('auth-token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: expiresIn
      });

      response.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: expiresIn
      });

      console.log('[Refresh API] Successfully refreshed tokens');
      return response;
    }

    console.log('[Refresh API] Invalid refresh token');
    return NextResponse.json(
      { message: 'Invalid refresh token' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[Refresh API] Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'No refresh token available' },
        { status: 401 }
      );
    }

    // Mock token refresh - in a real app, this would validate the refresh token
    if (refreshToken.startsWith('mock-refresh-token-')) {
      const accessToken = `mock-access-token-${Date.now()}`;
      const newRefreshToken = `mock-refresh-token-${Date.now()}`;
      const expiresIn = 60 * 60 * 24 * 7; // 7 days

      const response = NextResponse.json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn
      });

      // Set cookies
      response.cookies.set('token', accessToken, {
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

      response.cookies.set('token_expiry', String(Date.now() + expiresIn * 1000), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: expiresIn
      });

      return response;
    }

    // Clear cookies on invalid refresh token
    const errorResponse = NextResponse.json(
      { success: false, message: 'Invalid refresh token' },
      { status: 401 }
    );

    errorResponse.cookies.delete('token');
    errorResponse.cookies.delete('refresh_token');
    errorResponse.cookies.delete('token_expiry');

    return errorResponse;
  } catch (error) {
    console.error('[Refresh API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
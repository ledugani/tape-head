import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();
    
    console.log('LOGIN API Request Body:', { email, password, rememberMe }, 'Type of rememberMe:', typeof rememberMe, 'Value:', rememberMe);

    // Mock authentication - in a real app, this would validate against your backend
    if (email === 'iamtest@test.com' && password === 'password1') {
      const accessToken = `mock-access-token-${Date.now()}`;
      const refreshToken = `mock-refresh-token-${Date.now()}`;
      const expiresIn = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days or 7 days
      
      const response = NextResponse.json({ 
        success: true, 
        redirect: '/dashboard',
        accessToken,
        refreshToken,
        expiresIn,
        user: { email }
      });
      
      // Set cookie expiration based on remember me
      response.cookies.set('auth-token', accessToken, {
        httpOnly: false, // Allow JavaScript access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: expiresIn,
        domain: 'localhost' // Ensure cookies work in development
      });

      // Set refresh token cookie
      response.cookies.set('refresh_token', refreshToken, {
        httpOnly: false, // Allow JavaScript access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: expiresIn,
        domain: 'localhost' // Ensure cookies work in development
      });
      
      return response;
    }

    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
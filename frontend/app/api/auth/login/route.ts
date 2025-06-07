import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();
    
    console.log('LOGIN API Request Body:', { email, password, rememberMe }, 'Type of rememberMe:', typeof rememberMe, 'Value:', rememberMe);

    // Mock authentication - in a real app, this would validate against your backend
    if (email === 'iamtest@test.com' && password === 'password1') {
      const token = `mock-token-${Date.now()}`;
      const response = NextResponse.json({ success: true, redirect: '/dashboard' });
      
      // Set cookie expiration based on remember me
      let maxAge, reason;
      if (rememberMe) {
        maxAge = 60 * 60 * 24 * 30; // 30 days
        reason = 'rememberMe truthy';
      } else {
        maxAge = 60 * 60 * 24 * 7; // 7 days
        reason = 'rememberMe falsy or missing';
      }
      const expires = Math.floor(Date.now() / 1000) + maxAge;
      console.log('LOGIN API:', { now: new Date(), maxAge, expires, rememberMe, reason });
      
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
        expires: new Date(expires * 1000)
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
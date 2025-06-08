interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshPromise: Promise<TokenResponse> | null = null;

async function refreshTokens(): Promise<TokenResponse> {
  console.log('[refreshTokens] Starting token refresh');
  const refreshToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('refresh_token='))
    ?.split('=')[1];
  
  console.log('[refreshTokens] Refresh token available:', !!refreshToken);
  
  if (!refreshToken) {
    console.log('[refreshTokens] No refresh token available');
    throw new ApiError('No refresh token available', 401);
  }

  try {
    console.log('[refreshTokens] Making refresh request');
    const response = await fetch(`/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    console.log('[refreshTokens] Refresh response status:', response.status);

    if (!response.ok) {
      console.log('[refreshTokens] Refresh failed:', data);
      throw new ApiError(data.message || 'Failed to refresh token', response.status);
    }

    // Store new tokens in cookies
    console.log('[refreshTokens] Storing new tokens');
    const cookieOptions = [
      `path=/`,
      `max-age=${data.expiresIn}`,
      'SameSite=Lax',
      'Secure'
    ].join('; ');

    document.cookie = `auth-token=${data.accessToken}; ${cookieOptions}`;
    document.cookie = `refresh_token=${data.refreshToken}; ${cookieOptions}`;
    document.cookie = `token_expiry=${Date.now() + data.expiresIn * 1000}; ${cookieOptions}`;

    return data;
  } catch (error) {
    console.log('[refreshTokens] Error during refresh:', error);
    // Clear cookies on refresh failure
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'token_expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    throw error;
  }
}

export async function getValidToken(): Promise<string> {
  console.log('[getValidToken] Starting token validation');
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='))
    ?.split('=')[1];
  const expiry = document.cookie
    .split('; ')
    .find(row => row.startsWith('token_expiry='))
    ?.split('=')[1];
  
  console.log('[getValidToken] Current token state:', { 
    hasToken: !!token, 
    hasExpiry: !!expiry,
    expiryTime: expiry ? new Date(parseInt(expiry)).toISOString() : null,
    currentTime: new Date().toISOString()
  });

  if (!token || !expiry) {
    console.log('[getValidToken] No valid token available');
    throw new ApiError('No valid token available', 401);
  }

  // If token expires in less than 5 minutes, refresh it
  if (Date.now() + 5 * 60 * 1000 > parseInt(expiry)) {
    console.log('[getValidToken] Token needs refresh');
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens();
    }
    
    try {
      const { accessToken } = await refreshPromise!;
      console.log('[getValidToken] Successfully refreshed token');
      return accessToken;
    } finally {
      if (isRefreshing) {
        isRefreshing = false;
        refreshPromise = null;
      }
    }
  }

  console.log('[getValidToken] Using existing valid token');
  return token;
} 
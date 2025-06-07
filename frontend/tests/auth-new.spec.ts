import { test, expect } from '@playwright/test';

test('should handle collection fetch with token refresh', async ({ page }) => {
  // Navigate to login page and wait for it to be ready
  await page.goto('/login', { waitUntil: 'networkidle' });
  
  // Wait for the login form to be interactive
  await page.waitForSelector('[data-testid="login-button"]:not([disabled])');
  
  // Fill in login form
  await page.type('input[type="email"]', 'iamtest@test.com');
  await page.type('input[type="password"]', 'password1');
  
  // Click login and wait for dashboard welcome
  await page.click('[data-testid="login-button"]');
  await page.waitForSelector('[data-testid="dashboard-welcome"]', { timeout: 10000 });

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Debug: Print localStorage and cookies after login
  const debugState = await page.evaluate(() => ({
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    tokenExpiry: localStorage.getItem('token_expiry'),
    cookies: document.cookie
  }));
  console.log('DEBUG after login:', debugState);

  // Verify auth state
  expect(debugState.accessToken).toBeTruthy();
  expect(debugState.refreshToken).toBeTruthy();
  expect(debugState.tokenExpiry).toBeTruthy();
  expect(debugState.cookies).toContain('auth-token');
  expect(debugState.cookies).toContain('refresh_token');
}); 
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should handle login and collection loading', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
    
    // Verify dashboard content
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verify collection loading
    await expect(page.locator('[data-testid="collection-list"]')).toBeVisible();
  });

  test('should handle logout correctly', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Clear any existing auth state
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
    });

    // Fill in login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Click login and wait for navigation
    await Promise.all([
      page.waitForURL('/dashboard'),
      page.click('button[type="submit"]')
    ]);

    // Wait for dashboard to load
    await page.waitForSelector('h1', { state: 'visible', timeout: 10000 });

    // Click logout
    await page.click('[data-testid="logout-button"]');

    // Wait for navigation to login page
    await page.waitForURL('/login');

    // Verify auth state is cleared
    const authState = await page.evaluate(() => ({
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token'),
      tokenExpiry: localStorage.getItem('token_expiry'),
      userEmail: localStorage.getItem('user_email'),
      cookies: document.cookie
    }));

    expect(authState.accessToken).toBeNull();
    expect(authState.refreshToken).toBeNull();
    expect(authState.tokenExpiry).toBeNull();
    expect(authState.userEmail).toBeNull();
    expect(authState.cookies).not.toContain('auth-token');
  });
}); 
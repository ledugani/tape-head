import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should handle login and collection loading', async ({ page }) => {
    console.log('[Test] Starting login test');
    
    // Enable console logging
    page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
    
    // Log navigation events
    page.on('request', request => console.log(`[Navigation] Request: ${request.url()}`));
    page.on('response', response => console.log(`[Navigation] Response: ${response.url()} - ${response.status()}`));
    
    console.log('[Test] Navigating to login page');
    await page.goto('/login');
    console.log('[Test] Login page loaded');
    
    // Take a screenshot and log page content
    await page.screenshot({ path: 'login-page.png', fullPage: true });
    const content = await page.content();
    console.log('[Test] Page content:', content);
    
    console.log('[Test] Filling login form');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    console.log('[Test] Clicking login button');
    await page.click('button[type="submit"]');
    
    // Wait for navigation and log the URL
    await page.waitForURL('**/dashboard');
    console.log('[Test] Navigated to dashboard:', page.url());
    
    // Verify dashboard content
    await expect(page.locator('[data-testid="dashboard-welcome"]')).toBeVisible();
    console.log('[Test] Dashboard welcome message found');
    
    // Verify collection loading
    await expect(page.locator('[data-testid="collection-list"]')).toBeVisible();
    console.log('[Test] Collection list found');
  });

  test('should handle logout correctly', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Clear any existing auth state after navigation
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
    });

    // Fill in login form
    await page.fill('input[type="email"]', 'iamtest@test.com');
    await page.fill('input[type="password"]', 'password1');
    
    // Click login and wait for navigation
    await Promise.all([
      page.waitForURL('/dashboard'),
      page.click('[data-testid="login-button"]')
    ]);

    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-welcome"]', { state: 'visible', timeout: 10000 });

    // Click logout and wait for navigation
    await Promise.all([
      page.waitForURL('/login'),
      page.click('[data-testid="logout-button"]')
    ]);

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
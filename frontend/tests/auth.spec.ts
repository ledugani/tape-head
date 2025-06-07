import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing cookies before each test
    await page.context().clearCookies();
  });

  test('should handle login correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in the login form
    await page.fill('input[name="email"]', 'iamtest@test.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Click the login button and wait for navigation
    await Promise.all([
      page.waitForURL('/dashboard'),
      page.click('button[type="submit"]')
    ]);
    
    // Verify auth cookie was set
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(cookie => cookie.name === 'auth-token');
    expect(authCookie).toBeTruthy();
  });

  test('should handle login with remember me', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'iamtest@test.com');
    await page.fill('input[name="password"]', 'password1');
    
    // Check the remember me checkbox and wait for state update
    await page.evaluate(() => {
      const checkbox = document.querySelector('input[name="rememberMe"]') as HTMLInputElement;
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      checkbox.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // Wait for checkbox to be checked
    await page.waitForFunction(() => {
      const checkbox = document.querySelector('input[name="rememberMe"]') as HTMLInputElement;
      return checkbox.checked;
    });
    
    console.log('Checkbox checked:', await page.evaluate(() => {
      const checkbox = document.querySelector('input[name="rememberMe"]') as HTMLInputElement;
      return checkbox.checked;
    }));
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('/dashboard');
    
    // Get the auth cookie
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'auth-token');
    
    // Verify cookie expiration (30 days)
    const expectedExpiry = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    const oneDay = 24 * 60 * 60;
    
    // Log the actual values for debugging
    console.log('Cookie expiration:', {
      expected: expectedExpiry,
      actual: authCookie?.expires,
      difference: authCookie?.expires ? expectedExpiry - authCookie.expires : 'N/A'
    });
    
    expect(authCookie?.expires).toBeGreaterThan(expectedExpiry - oneDay);
    expect(authCookie?.expires).toBeLessThan(expectedExpiry + oneDay);
  });

  test('should handle logout correctly', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'iamtest@test.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Click login and wait for navigation
    await Promise.all([
      page.waitForURL('/dashboard'),
      page.click('button[type="submit"]')
    ]);
    
    // Verify we're logged in
    const cookiesBefore = await page.context().cookies();
    const authCookieBefore = cookiesBefore.find(cookie => cookie.name === 'auth-token');
    expect(authCookieBefore).toBeTruthy();
    
    // Wait for the logout button to be visible
    const logoutButton = await page.waitForSelector('button[data-testid="logout-button"]');
    
    // Click logout and wait for navigation
    await Promise.all([
      page.waitForURL(/\/login(\?.*)?$/),
      logoutButton.click()
    ]);
    
    // Verify auth cookie was cleared
    const cookiesAfter = await page.context().cookies();
    const authCookieAfter = cookiesAfter.find(cookie => cookie.name === 'auth-token');
    expect(authCookieAfter).toBeFalsy();
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?from=%2Fdashboard$/);
  });

  test('should redirect to dashboard when accessing login with valid auth', async ({ page }) => {
    // First log in
    await page.goto('/login');
    await page.fill('input[name="email"]', 'iamtest@test.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Click login and wait for navigation
    await Promise.all([
      page.waitForURL('/dashboard'),
      page.click('button[type="submit"]')
    ]);
    
    // Then try to access login page again
    await page.goto('/login');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show loading state during authentication', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    
    // Navigate to protected route
    await page.goto('/dashboard');
    
    // Should show loading spinner immediately
    const loadingSpinner = await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'visible', timeout: 5000 });
    expect(loadingSpinner).toBeTruthy();
    
    // Should eventually redirect to login
    await page.waitForURL(/\/login(\?.*)?$/);
    
    // Verify we're on the login page
    expect(page.url()).toContain('/login');
  });

  test('should preserve return URL after login', async ({ page }) => {
    // Try to access a protected route
    await page.goto('/dashboard');
    
    // Should be redirected to login with return URL
    await expect(page).toHaveURL(/\/login\?from=%2Fdashboard$/);
    
    // Log in
    await page.fill('input[name="email"]', 'iamtest@test.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Click login and wait for navigation
    await Promise.all([
      page.waitForURL('/dashboard'),
      page.click('button[type="submit"]')
    ]);
  });
}); 
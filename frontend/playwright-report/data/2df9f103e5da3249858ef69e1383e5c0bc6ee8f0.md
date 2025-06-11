# Test info

- Name: Authentication >> should handle logout correctly
- Location: /Users/thomasdugan/workspace/tape-head/frontend/tests/auth.spec.ts:43:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

    at /Users/thomasdugan/workspace/tape-head/frontend/tests/auth.spec.ts:45:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Authentication', () => {
   4 |   test('should handle login and collection loading', async ({ page }) => {
   5 |     console.log('[Test] Starting login test');
   6 |     
   7 |     // Enable console logging
   8 |     page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
   9 |     
  10 |     // Log navigation events
  11 |     page.on('request', request => console.log(`[Navigation] Request: ${request.url()}`));
  12 |     page.on('response', response => console.log(`[Navigation] Response: ${response.url()} - ${response.status()}`));
  13 |     
  14 |     console.log('[Test] Navigating to login page');
  15 |     await page.goto('/login');
  16 |     console.log('[Test] Login page loaded');
  17 |     
  18 |     // Take a screenshot and log page content
  19 |     await page.screenshot({ path: 'login-page.png', fullPage: true });
  20 |     const content = await page.content();
  21 |     console.log('[Test] Page content:', content);
  22 |     
  23 |     console.log('[Test] Filling login form');
  24 |     await page.fill('input[name="email"]', 'user@example.com');
  25 |     await page.fill('input[name="password"]', 'password123');
  26 |     
  27 |     console.log('[Test] Clicking login button');
  28 |     await page.click('button[type="submit"]');
  29 |     
  30 |     // Wait for navigation and log the URL
  31 |     await page.waitForURL('**/dashboard');
  32 |     console.log('[Test] Navigated to dashboard:', page.url());
  33 |     
  34 |     // Verify dashboard content
  35 |     await expect(page.locator('[data-testid="dashboard-welcome"]')).toBeVisible();
  36 |     console.log('[Test] Dashboard welcome message found');
  37 |     
  38 |     // Verify collection loading
  39 |     await expect(page.locator('[data-testid="collection-list"]')).toBeVisible();
  40 |     console.log('[Test] Collection list found');
  41 |   });
  42 |
  43 |   test('should handle logout correctly', async ({ page }) => {
  44 |     // Navigate to login page
> 45 |     await page.goto('/login');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
  46 |     
  47 |     // Clear any existing auth state after navigation
  48 |     await page.evaluate(() => {
  49 |       localStorage.clear();
  50 |       document.cookie.split(';').forEach(cookie => {
  51 |         document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
  52 |       });
  53 |     });
  54 |
  55 |     // Fill in login form
  56 |     await page.fill('input[type="email"]', 'iamtest@test.com');
  57 |     await page.fill('input[type="password"]', 'password1');
  58 |     
  59 |     // Click login and wait for navigation
  60 |     await Promise.all([
  61 |       page.waitForURL('/dashboard'),
  62 |       page.click('[data-testid="login-button"]')
  63 |     ]);
  64 |
  65 |     // Wait for dashboard to load
  66 |     await page.waitForSelector('[data-testid="dashboard-welcome"]', { state: 'visible', timeout: 10000 });
  67 |
  68 |     // Click logout and wait for navigation
  69 |     await Promise.all([
  70 |       page.waitForURL('/login'),
  71 |       page.click('[data-testid="logout-button"]')
  72 |     ]);
  73 |
  74 |     // Verify auth state is cleared
  75 |     const authState = await page.evaluate(() => ({
  76 |       accessToken: localStorage.getItem('access_token'),
  77 |       refreshToken: localStorage.getItem('refresh_token'),
  78 |       tokenExpiry: localStorage.getItem('token_expiry'),
  79 |       userEmail: localStorage.getItem('user_email'),
  80 |       cookies: document.cookie
  81 |     }));
  82 |
  83 |     expect(authState.accessToken).toBeNull();
  84 |     expect(authState.refreshToken).toBeNull();
  85 |     expect(authState.tokenExpiry).toBeNull();
  86 |     expect(authState.userEmail).toBeNull();
  87 |     expect(authState.cookies).not.toContain('auth-token');
  88 |   });
  89 | }); 
```
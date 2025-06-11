# Test info

- Name: should handle collection fetch with token refresh
- Location: /Users/thomasdugan/workspace/tape-head/frontend/tests/auth-new.spec.ts:3:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "networkidle"

    at /Users/thomasdugan/workspace/tape-head/frontend/tests/auth-new.spec.ts:5:14
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('should handle collection fetch with token refresh', async ({ page }) => {
   4 |   // Navigate to login page and wait for it to be ready
>  5 |   await page.goto('/login', { waitUntil: 'networkidle' });
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
   6 |   
   7 |   // Wait for the login form to be interactive
   8 |   await page.waitForSelector('[data-testid="login-button"]:not([disabled])');
   9 |   
  10 |   // Fill in login form
  11 |   await page.type('input[type="email"]', 'iamtest@test.com');
  12 |   await page.type('input[type="password"]', 'password1');
  13 |   
  14 |   // Click login and wait for dashboard welcome
  15 |   await page.click('[data-testid="login-button"]');
  16 |   await page.waitForSelector('[data-testid="dashboard-welcome"]', { timeout: 10000 });
  17 |
  18 |   // Wait for the page to be fully loaded
  19 |   await page.waitForLoadState('networkidle');
  20 |
  21 |   // Debug: Print localStorage and cookies after login
  22 |   const debugState = await page.evaluate(() => ({
  23 |     accessToken: localStorage.getItem('access_token'),
  24 |     refreshToken: localStorage.getItem('refresh_token'),
  25 |     tokenExpiry: localStorage.getItem('token_expiry'),
  26 |     cookies: document.cookie
  27 |   }));
  28 |   console.log('DEBUG after login:', debugState);
  29 |
  30 |   // Verify auth state
  31 |   expect(debugState.accessToken).toBeTruthy();
  32 |   expect(debugState.refreshToken).toBeTruthy();
  33 |   expect(debugState.tokenExpiry).toBeTruthy();
  34 |   expect(debugState.cookies).toContain('auth-token');
  35 |   expect(debugState.cookies).toContain('refresh_token');
  36 | }); 
```
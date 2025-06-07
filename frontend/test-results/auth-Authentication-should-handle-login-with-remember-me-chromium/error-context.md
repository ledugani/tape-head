# Test info

- Name: Authentication >> should handle login with remember me
- Location: /Users/thomasdugan/workspace/tape-head/frontend/tests/auth.spec.ts:28:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 1751771695
Received:   1749870895.913611
    at /Users/thomasdugan/workspace/tape-head/frontend/tests/auth.spec.ts:73:33
```

# Page snapshot

```yaml
- alert
- heading "Welcome, User" [level=1]
- button "Logout"
- navigation:
  - button "Collection"
  - button "Wantlist"
- img "The Terminator"
- heading "The Terminator" [level=3]
- paragraph
- paragraph
- img "Back to the Future"
- heading "Back to the Future" [level=3]
- paragraph
- paragraph
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Authentication', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Clear any existing cookies before each test
   6 |     await page.context().clearCookies();
   7 |   });
   8 |
   9 |   test('should handle login correctly', async ({ page }) => {
   10 |     await page.goto('/login');
   11 |     
   12 |     // Fill in the login form
   13 |     await page.fill('input[name="email"]', 'iamtest@test.com');
   14 |     await page.fill('input[name="password"]', 'password123');
   15 |     
   16 |     // Click the login button and wait for navigation
   17 |     await Promise.all([
   18 |       page.waitForURL('/dashboard'),
   19 |       page.click('button[type="submit"]')
   20 |     ]);
   21 |     
   22 |     // Verify auth cookie was set
   23 |     const cookies = await page.context().cookies();
   24 |     const authCookie = cookies.find(cookie => cookie.name === 'auth-token');
   25 |     expect(authCookie).toBeTruthy();
   26 |   });
   27 |
   28 |   test('should handle login with remember me', async ({ page }) => {
   29 |     await page.goto('/login');
   30 |     await page.fill('input[name="email"]', 'iamtest@test.com');
   31 |     await page.fill('input[name="password"]', 'password1');
   32 |     
   33 |     // Check the remember me checkbox and wait for state update
   34 |     await page.evaluate(() => {
   35 |       const checkbox = document.querySelector('input[name="rememberMe"]') as HTMLInputElement;
   36 |       checkbox.checked = true;
   37 |       checkbox.dispatchEvent(new Event('change', { bubbles: true }));
   38 |       checkbox.dispatchEvent(new Event('input', { bubbles: true }));
   39 |     });
   40 |     
   41 |     // Wait for checkbox to be checked
   42 |     await page.waitForFunction(() => {
   43 |       const checkbox = document.querySelector('input[name="rememberMe"]') as HTMLInputElement;
   44 |       return checkbox.checked;
   45 |     });
   46 |     
   47 |     console.log('Checkbox checked:', await page.evaluate(() => {
   48 |       const checkbox = document.querySelector('input[name="rememberMe"]') as HTMLInputElement;
   49 |       return checkbox.checked;
   50 |     }));
   51 |     
   52 |     // Submit the form
   53 |     await page.click('button[type="submit"]');
   54 |     
   55 |     // Wait for navigation to complete
   56 |     await page.waitForURL('/dashboard');
   57 |     
   58 |     // Get the auth cookie
   59 |     const cookies = await page.context().cookies();
   60 |     const authCookie = cookies.find(c => c.name === 'auth-token');
   61 |     
   62 |     // Verify cookie expiration (30 days)
   63 |     const expectedExpiry = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
   64 |     const oneDay = 24 * 60 * 60;
   65 |     
   66 |     // Log the actual values for debugging
   67 |     console.log('Cookie expiration:', {
   68 |       expected: expectedExpiry,
   69 |       actual: authCookie?.expires,
   70 |       difference: authCookie?.expires ? expectedExpiry - authCookie.expires : 'N/A'
   71 |     });
   72 |     
>  73 |     expect(authCookie?.expires).toBeGreaterThan(expectedExpiry - oneDay);
      |                                 ^ Error: expect(received).toBeGreaterThan(expected)
   74 |     expect(authCookie?.expires).toBeLessThan(expectedExpiry + oneDay);
   75 |   });
   76 |
   77 |   test('should handle logout correctly', async ({ page }) => {
   78 |     // Log in first
   79 |     await page.goto('/login');
   80 |     await page.fill('input[name="email"]', 'iamtest@test.com');
   81 |     await page.fill('input[name="password"]', 'password123');
   82 |     
   83 |     // Click login and wait for navigation
   84 |     await Promise.all([
   85 |       page.waitForURL('/dashboard'),
   86 |       page.click('button[type="submit"]')
   87 |     ]);
   88 |     
   89 |     // Verify we're logged in
   90 |     const cookiesBefore = await page.context().cookies();
   91 |     const authCookieBefore = cookiesBefore.find(cookie => cookie.name === 'auth-token');
   92 |     expect(authCookieBefore).toBeTruthy();
   93 |     
   94 |     // Wait for the logout button to be visible
   95 |     const logoutButton = await page.waitForSelector('button[data-testid="logout-button"]');
   96 |     
   97 |     // Click logout and wait for navigation
   98 |     await Promise.all([
   99 |       page.waitForURL(/\/login(\?.*)?$/),
  100 |       logoutButton.click()
  101 |     ]);
  102 |     
  103 |     // Verify auth cookie was cleared
  104 |     const cookiesAfter = await page.context().cookies();
  105 |     const authCookieAfter = cookiesAfter.find(cookie => cookie.name === 'auth-token');
  106 |     expect(authCookieAfter).toBeFalsy();
  107 |   });
  108 |
  109 |   test('should redirect to login when accessing protected route without auth', async ({ page }) => {
  110 |     await page.goto('/dashboard');
  111 |     await expect(page).toHaveURL(/\/login\?from=%2Fdashboard$/);
  112 |   });
  113 |
  114 |   test('should redirect to dashboard when accessing login with valid auth', async ({ page }) => {
  115 |     // First log in
  116 |     await page.goto('/login');
  117 |     await page.fill('input[name="email"]', 'iamtest@test.com');
  118 |     await page.fill('input[name="password"]', 'password123');
  119 |     
  120 |     // Click login and wait for navigation
  121 |     await Promise.all([
  122 |       page.waitForURL('/dashboard'),
  123 |       page.click('button[type="submit"]')
  124 |     ]);
  125 |     
  126 |     // Then try to access login page again
  127 |     await page.goto('/login');
  128 |     await expect(page).toHaveURL('/dashboard');
  129 |   });
  130 |
  131 |   test('should show loading state during authentication', async ({ page }) => {
  132 |     // Clear any existing auth state
  133 |     await page.context().clearCookies();
  134 |     
  135 |     // Navigate to protected route
  136 |     await page.goto('/dashboard');
  137 |     
  138 |     // Should show loading spinner immediately
  139 |     const loadingSpinner = await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'visible', timeout: 5000 });
  140 |     expect(loadingSpinner).toBeTruthy();
  141 |     
  142 |     // Should eventually redirect to login
  143 |     await page.waitForURL(/\/login(\?.*)?$/);
  144 |     
  145 |     // Verify we're on the login page
  146 |     expect(page.url()).toContain('/login');
  147 |   });
  148 |
  149 |   test('should preserve return URL after login', async ({ page }) => {
  150 |     // Try to access a protected route
  151 |     await page.goto('/dashboard');
  152 |     
  153 |     // Should be redirected to login with return URL
  154 |     await expect(page).toHaveURL(/\/login\?from=%2Fdashboard$/);
  155 |     
  156 |     // Log in
  157 |     await page.fill('input[name="email"]', 'iamtest@test.com');
  158 |     await page.fill('input[name="password"]', 'password123');
  159 |     
  160 |     // Click login and wait for navigation
  161 |     await Promise.all([
  162 |       page.waitForURL('/dashboard'),
  163 |       page.click('button[type="submit"]')
  164 |     ]);
  165 |   });
  166 | }); 
```
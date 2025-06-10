# Test info

- Name: Authentication Flow >> should login and access dashboard with collection and wantlist
- Location: /Users/thomasdugan/workspace/tape-head/frontend/tests/auth-flow.spec.ts:4:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

    at /Users/thomasdugan/workspace/tape-head/frontend/tests/auth-flow.spec.ts:6:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Authentication Flow', () => {
   4 |   test('should login and access dashboard with collection and wantlist', async ({ page }) => {
   5 |     // 1. Navigate to login page
>  6 |     await page.goto('/login');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
   7 |     await expect(page).toHaveURL('/login');
   8 |
   9 |     // 2. Fill out login form
  10 |     await page.getByLabel('Email address').fill('iamtest@test.com');
  11 |     await page.getByLabel('Password').fill('password1');
  12 |     await page.getByRole('button', { name: 'Sign in' }).click();
  13 |
  14 |     // 3. Assert redirect to dashboard
  15 |     await expect(page).toHaveURL('/dashboard');
  16 |
  17 |     // 4. Assert dashboard welcome message
  18 |     await expect(page.getByTestId('dashboard-welcome')).toBeVisible();
  19 |
  20 |     // 5. Assert default collection section is rendered
  21 |     await expect(page.getByTestId('collection-list')).toBeVisible();
  22 |
  23 |     // 6. Switch to Wantlist tab
  24 |     await page.getByRole('button', { name: 'Wantlist' }).click();
  25 |
  26 |     // 7. Assert wantlist section is rendered
  27 |     await expect(page.getByTestId('wantlist-list')).toBeVisible();
  28 |
  29 |     // 8. Assert no visible error messages
  30 |     const errorMessages = page.getByText(/error/i);
  31 |     await expect(errorMessages).toHaveCount(0);
  32 |   });
  33 | });
  34 |
```
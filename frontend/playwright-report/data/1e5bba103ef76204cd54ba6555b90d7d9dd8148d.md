# Test info

- Name: debug Next.js environment
- Location: /Users/thomasdugan/workspace/tape-head/frontend/tests/debug.spec.ts:3:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "networkidle"

    at /Users/thomasdugan/workspace/tape-head/frontend/tests/debug.spec.ts:26:14
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('debug Next.js environment', async ({ page }) => {
   4 |   // 1. Check if we can execute JavaScript
   5 |   const jsEnabled = await page.evaluate(() => {
   6 |     console.log('JavaScript is running');
   7 |     return true;
   8 |   });
   9 |   expect(jsEnabled).toBe(true);
  10 |
  11 |   // 2. Check if Next.js is running in development mode
  12 |   const nextDev = await page.evaluate(() => {
  13 |     // @ts-ignore
  14 |     return window.__NEXT_DATA__?.buildId === 'development';
  15 |   });
  16 |   console.log('Next.js development mode:', nextDev);
  17 |
  18 |   // 3. Check if React is loaded
  19 |   const reactLoaded = await page.evaluate(() => {
  20 |     // @ts-ignore
  21 |     return window.__NEXT_DATA__?.props?.pageProps !== undefined;
  22 |   });
  23 |   console.log('React loaded:', reactLoaded);
  24 |
  25 |   // 4. Try to manually trigger a state update
> 26 |   await page.goto('/login', { waitUntil: 'networkidle' });
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
  27 |   
  28 |   // Wait for the page to be interactive
  29 |   await page.waitForSelector('[data-testid="login-button"]');
  30 |   
  31 |   // Try to update state manually
  32 |   const stateUpdated = await page.evaluate(() => {
  33 |     const button = document.querySelector('[data-testid="login-button"]');
  34 |     if (!button) return false;
  35 |     
  36 |     // Try to trigger a React state update
  37 |     const event = new Event('click', { bubbles: true });
  38 |     button.dispatchEvent(event);
  39 |     
  40 |     return true;
  41 |   });
  42 |   console.log('State update attempted:', stateUpdated);
  43 |
  44 |   // 5. Check if localStorage is accessible
  45 |   const localStorageAccessible = await page.evaluate(() => {
  46 |     try {
  47 |       localStorage.setItem('test', 'test');
  48 |       const value = localStorage.getItem('test');
  49 |       localStorage.removeItem('test');
  50 |       return value === 'test';
  51 |     } catch (e) {
  52 |       return false;
  53 |     }
  54 |   });
  55 |   console.log('localStorage accessible:', localStorageAccessible);
  56 |
  57 |   // 6. Check if cookies are accessible
  58 |   const cookiesAccessible = await page.evaluate(() => {
  59 |     try {
  60 |       document.cookie = 'test=test';
  61 |       const hasCookie = document.cookie.includes('test=test');
  62 |       document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  63 |       return hasCookie;
  64 |     } catch (e) {
  65 |       return false;
  66 |     }
  67 |   });
  68 |   console.log('Cookies accessible:', cookiesAccessible);
  69 | }); 
```
# Test info

- Name: should see hydration and context logs in browser console
- Location: /Users/thomasdugan/workspace/tape-head/frontend/tests/hydration.spec.ts:3:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "networkidle"

    at /Users/thomasdugan/workspace/tape-head/frontend/tests/hydration.spec.ts:6:14
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('should see hydration and context logs in browser console', async ({ page }) => {
   4 |   const logs: string[] = [];
   5 |   page.on('console', msg => logs.push(msg.text()));
>  6 |   await page.goto('/login', { waitUntil: 'networkidle' });
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
   7 |   await page.waitForSelector('[data-testid="login-button"]:not([disabled])');
   8 |   await page.waitForTimeout(1000);
   9 |   expect(logs.some(log => log.includes('[LoginPage] component rendered'))).toBeTruthy();
  10 |   expect(logs.some(log => log.includes('[AuthContext] file loaded'))).toBeTruthy();
  11 | }); 
```
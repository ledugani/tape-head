# Test info

- Name: basic test
- Location: /Users/thomasdugan/workspace/tape-head/frontend/tests/basic.spec.ts:3:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

    at /Users/thomasdugan/workspace/tape-head/frontend/tests/basic.spec.ts:4:14
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 |
  3 | test('basic test', async ({ page }) => {
> 4 |   await page.goto('/');
    |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  5 |   const title = await page.title();
  6 |   console.log('Page title:', title);
  7 |   expect(title).toBeTruthy();
  8 | }); 
```
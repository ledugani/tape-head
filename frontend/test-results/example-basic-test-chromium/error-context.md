# Test info

- Name: basic test
- Location: /Users/thomasdugan/workspace/tape-head/frontend/tests/example.spec.ts:3:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3002/
Call log:
  - navigating to "http://localhost:3002/", waiting until "load"

    at /Users/thomasdugan/workspace/tape-head/frontend/tests/example.spec.ts:16:16
```

# Test source

```ts
   1 | import { chromium, test, expect } from '@playwright/test';
   2 |
   3 | test('basic test', async () => {
   4 |   // Launch browser
   5 |   const browser = await chromium.launch({ headless: false });
   6 |   
   7 |   try {
   8 |     // Create a new context
   9 |     const context = await browser.newContext();
  10 |     
  11 |     // Create a new page
  12 |     const page = await context.newPage();
  13 |     
  14 |     // Navigate to the page
  15 |     console.log('Navigating to page...');
> 16 |     await page.goto('http://localhost:3002');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3002/
  17 |     
  18 |     // Get the title
  19 |     const title = await page.title();
  20 |     console.log('Page title:', title);
  21 |     
  22 |     // Basic assertion
  23 |     expect(title).toBeTruthy();
  24 |   } finally {
  25 |     // Clean up
  26 |     await browser.close();
  27 |   }
  28 | }); 
```
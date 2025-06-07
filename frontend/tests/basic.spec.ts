import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  console.log('Page title:', title);
  expect(title).toBeTruthy();
}); 
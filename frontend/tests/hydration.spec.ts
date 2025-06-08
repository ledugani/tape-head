import { test, expect } from '@playwright/test';

test('should see hydration and context logs in browser console', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', msg => logs.push(msg.text()));
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="login-button"]:not([disabled])');
  await page.waitForTimeout(1000);
  expect(logs.some(log => log.includes('[LoginPage] component rendered'))).toBeTruthy();
  expect(logs.some(log => log.includes('[AuthContext] file loaded'))).toBeTruthy();
}); 
import { test, expect } from '@playwright/test';

test('debug Next.js environment', async ({ page }) => {
  // 1. Check if we can execute JavaScript
  const jsEnabled = await page.evaluate(() => {
    console.log('JavaScript is running');
    return true;
  });
  expect(jsEnabled).toBe(true);

  // 2. Check if Next.js is running in development mode
  const nextDev = await page.evaluate(() => {
    // @ts-ignore
    return window.__NEXT_DATA__?.buildId === 'development';
  });
  console.log('Next.js development mode:', nextDev);

  // 3. Check if React is loaded
  const reactLoaded = await page.evaluate(() => {
    // @ts-ignore
    return window.__NEXT_DATA__?.props?.pageProps !== undefined;
  });
  console.log('React loaded:', reactLoaded);

  // 4. Try to manually trigger a state update
  await page.goto('/login', { waitUntil: 'networkidle' });
  
  // Wait for the page to be interactive
  await page.waitForSelector('[data-testid="login-button"]');
  
  // Try to update state manually
  const stateUpdated = await page.evaluate(() => {
    const button = document.querySelector('[data-testid="login-button"]');
    if (!button) return false;
    
    // Try to trigger a React state update
    const event = new Event('click', { bubbles: true });
    button.dispatchEvent(event);
    
    return true;
  });
  console.log('State update attempted:', stateUpdated);

  // 5. Check if localStorage is accessible
  const localStorageAccessible = await page.evaluate(() => {
    try {
      localStorage.setItem('test', 'test');
      const value = localStorage.getItem('test');
      localStorage.removeItem('test');
      return value === 'test';
    } catch (e) {
      return false;
    }
  });
  console.log('localStorage accessible:', localStorageAccessible);

  // 6. Check if cookies are accessible
  const cookiesAccessible = await page.evaluate(() => {
    try {
      document.cookie = 'test=test';
      const hasCookie = document.cookie.includes('test=test');
      document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return hasCookie;
    } catch (e) {
      return false;
    }
  });
  console.log('Cookies accessible:', cookiesAccessible);
}); 
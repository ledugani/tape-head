import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login and access dashboard with collection and wantlist', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/login');
    await expect(page).toHaveURL('/login');

    // 2. Fill out login form
    await page.getByLabel('Email address').fill('iamtest@test.com');
    await page.getByLabel('Password').fill('password1');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // 3. Assert redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // 4. Assert dashboard welcome message
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible();

    // 5. Assert default collection section is rendered
    await expect(page.getByTestId('collection-list')).toBeVisible();

    // 6. Switch to Wantlist tab
    await page.getByRole('button', { name: 'Wantlist' }).click();

    // 7. Assert wantlist section is rendered
    await expect(page.getByTestId('wantlist-list')).toBeVisible();

    // 8. Assert no visible error messages
    const errorMessages = page.getByText(/error/i);
    await expect(errorMessages).toHaveCount(0);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Wantlist Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to wantlist page
    await page.goto('/wantlist');
  });

  test('should display wantlist items', async ({ page }) => {
    // Wait for the wantlist items to load
    await page.waitForSelector('[data-testid="wantlist-item"]');
    
    // Check if items are displayed
    const items = await page.locator('[data-testid="wantlist-item"]').all();
    expect(items.length).toBeGreaterThan(0);
  });

  test('should filter wantlist items', async ({ page }) => {
    // Wait for the wantlist items to load
    await page.waitForSelector('[data-testid="wantlist-item"]');
    
    // Get initial item count
    const initialItems = await page.locator('[data-testid="wantlist-item"]').all();
    const initialCount = initialItems.length;
    
    // Apply a filter
    await page.fill('[data-testid="search-input"]', 'test');
    await page.keyboard.press('Enter');
    
    // Wait for filtered results
    await page.waitForTimeout(500); // Wait for debounce
    
    // Check if items are filtered
    const filteredItems = await page.locator('[data-testid="wantlist-item"]').all();
    expect(filteredItems.length).toBeLessThanOrEqual(initialCount);
  });

  test('should sort wantlist items', async ({ page }) => {
    // Wait for the wantlist items to load
    await page.waitForSelector('[data-testid="wantlist-item"]');
    
    // Get initial order
    const initialItems = await page.locator('[data-testid="wantlist-item"]').all();
    const initialOrder = await Promise.all(
      initialItems.map(item => item.textContent())
    );
    
    // Change sort order
    await page.selectOption('[data-testid="sort-select"]', 'title-asc');
    
    // Wait for sorted results
    await page.waitForTimeout(500);
    
    // Get new order
    const sortedItems = await page.locator('[data-testid="wantlist-item"]').all();
    const sortedOrder = await Promise.all(
      sortedItems.map(item => item.textContent())
    );
    
    // Check if order changed
    expect(sortedOrder).not.toEqual(initialOrder);
  });

  test('should navigate to item details', async ({ page }) => {
    // Wait for the wantlist items to load
    await page.waitForSelector('[data-testid="wantlist-item"]');
    
    // Click first item
    await page.locator('[data-testid="wantlist-item"]').first().click();
    
    // Check if navigated to details page
    await expect(page).toHaveURL(/.*\/wantlist\/.*/);
    await expect(page.locator('[data-testid="item-details"]')).toBeVisible();
  });

  test('should add item to wantlist', async ({ page }) => {
    // Navigate to collection page
    await page.goto('/collection');
    
    // Wait for collection items to load
    await page.waitForSelector('[data-testid="collection-item"]');
    
    // Click add to wantlist button on first item
    await page.locator('[data-testid="add-to-wantlist"]').first().click();
    
    // Navigate to wantlist page
    await page.goto('/wantlist');
    
    // Wait for wantlist items to load
    await page.waitForSelector('[data-testid="wantlist-item"]');
    
    // Check if item was added
    const items = await page.locator('[data-testid="wantlist-item"]').all();
    expect(items.length).toBeGreaterThan(0);
  });
}); 
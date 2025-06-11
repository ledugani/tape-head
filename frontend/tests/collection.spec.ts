import { test, expect } from '@playwright/test';

test.describe('Collection Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to collection page
    await page.goto('/collection');
  });

  test('should display collection items', async ({ page }) => {
    // Wait for the collection items to load
    await page.waitForSelector('[data-testid="collection-item"]');
    
    // Check if items are displayed
    const items = await page.locator('[data-testid="collection-item"]').all();
    expect(items.length).toBeGreaterThan(0);
  });

  test('should filter collection items', async ({ page }) => {
    // Wait for the collection items to load
    await page.waitForSelector('[data-testid="collection-item"]');
    
    // Get initial item count
    const initialItems = await page.locator('[data-testid="collection-item"]').all();
    const initialCount = initialItems.length;
    
    // Apply a filter
    await page.fill('[data-testid="search-input"]', 'test');
    await page.keyboard.press('Enter');
    
    // Wait for filtered results
    await page.waitForTimeout(500); // Wait for debounce
    
    // Check if items are filtered
    const filteredItems = await page.locator('[data-testid="collection-item"]').all();
    expect(filteredItems.length).toBeLessThanOrEqual(initialCount);
  });

  test('should sort collection items', async ({ page }) => {
    // Wait for the collection items to load
    await page.waitForSelector('[data-testid="collection-item"]');
    
    // Get initial order
    const initialItems = await page.locator('[data-testid="collection-item"]').all();
    const initialOrder = await Promise.all(
      initialItems.map(item => item.textContent())
    );
    
    // Change sort order
    await page.selectOption('[data-testid="sort-select"]', 'title-asc');
    
    // Wait for sorted results
    await page.waitForTimeout(500);
    
    // Get new order
    const sortedItems = await page.locator('[data-testid="collection-item"]').all();
    const sortedOrder = await Promise.all(
      sortedItems.map(item => item.textContent())
    );
    
    // Check if order changed
    expect(sortedOrder).not.toEqual(initialOrder);
  });

  test('should navigate to item details', async ({ page }) => {
    // Wait for the collection items to load
    await page.waitForSelector('[data-testid="collection-item"]');
    
    // Click first item
    await page.locator('[data-testid="collection-item"]').first().click();
    
    // Check if navigated to details page
    await expect(page).toHaveURL(/.*\/collection\/.*/);
    await expect(page.locator('[data-testid="item-details"]')).toBeVisible();
  });
}); 
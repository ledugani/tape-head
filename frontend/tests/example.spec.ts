import { chromium, test, expect } from '@playwright/test';

test('basic test', async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  
  try {
    // Create a new context
    const context = await browser.newContext();
    
    // Create a new page
    const page = await context.newPage();
    
    // Navigate to the page
    console.log('Navigating to page...');
    await page.goto('http://localhost:3002');
    
    // Get the title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Basic assertion
    expect(title).toBeTruthy();
  } finally {
    // Clean up
    await browser.close();
  }
}); 
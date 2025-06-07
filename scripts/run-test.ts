import { chromium } from '@playwright/test';

async function runTest() {
  console.log('Starting test...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  
  try {
    // Create a new context
    const context = await browser.newContext();
    
    // Create a new page
    const page = await context.newPage();
    
    // Navigate to the page
    console.log('Navigating to page...');
    await page.goto('http://localhost:3000');
    
    // Get the title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Basic assertion
    if (!title) {
      throw new Error('Page title is empty');
    }
    
    console.log('Test passed!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    // Clean up
    await browser.close();
  }
}

runTest(); 
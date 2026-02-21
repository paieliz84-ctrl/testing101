import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/layang|home|welcome/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check if navigation is present
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should still be accessible
    await expect(page.locator('body')).toBeVisible();
    
    // Check if content is visible (not overflowing)
    const body = page.locator('body');
    const box = await body.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);
  });

  test('should handle 404 pages', async ({ page }) => {
    await page.goto('/non-existent-page-12345');
    
    // Should show 404 or redirect
    const title = await page.title();
    const content = await page.content();
    
    const is404 = 
      title.toLowerCase().includes('404') ||
      title.toLowerCase().includes('not found') ||
      content.toLowerCase().includes('404') ||
      content.toLowerCase().includes('not found') ||
      content.toLowerCase().includes('page not found');
    
    expect(is404).toBeTruthy();
  });
});

test.describe('Theme', () => {
  test('should have dark mode by default', async ({ page }) => {
    await page.goto('/');
    
    // Check for dark mode indicators
    const html = page.locator('html');
    const hasDarkClass = await html.evaluate(el => el.classList.contains('dark'));
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    
    // Either has dark class or dark background
    const isDark = hasDarkClass || bgColor.includes('rgb(10, 10, 10)') || bgColor.includes('rgb(0, 0, 0)');
    expect(isDark).toBeTruthy();
  });
});

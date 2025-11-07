import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all public pages', async ({ page }) => {
    await page.goto('/');
    
    // Landing page
    await expect(page.locator('h1')).toContainText(/Transparent Revenue/i);
    
    // Navigate to leaderboard
    await page.click('a:has-text("Leaderboard")');
    await expect(page).toHaveURL(/\/leaderboard/);
    
    // Navigate to explore
    await page.click('a:has-text("Explore")');
    await expect(page).toHaveURL(/\/explore/);
    
    // Navigate to about
    await page.click('a:has-text("About")');
    await expect(page).toHaveURL(/\/about/);
    
    // Navigate to features
    await page.click('a:has-text("Features")');
    await expect(page).toHaveURL(/\/features/);
    
    // Navigate to pricing
    await page.click('a:has-text("Pricing")');
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('should navigate to dashboard sections', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should show dashboard
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
  });
});


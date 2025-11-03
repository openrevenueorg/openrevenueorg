import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should display onboarding steps', async ({ page }) => {
    await page.goto('/dashboard/onboarding');
    
    // Should show step 1
    await expect(page.locator('text=Startup Details')).toBeVisible();
  });

  test('should allow choosing direct integration', async ({ page }) => {
    await page.goto('/dashboard/onboarding');
    
    // Skip to step 3 (connection step)
    // In real test, would navigate through steps
    
    // Select direct integration
    await page.selectOption('select', 'direct');
    
    // Should show provider dropdown and API key input
    await expect(page.locator('select').nth(1)).toBeVisible();
  });

  test('should allow choosing standalone integration', async ({ page }) => {
    await page.goto('/dashboard/onboarding');
    
    // Select standalone integration
    await page.selectOption('select', 'standalone');
    
    // Should show endpoint URL and API key inputs
    await expect(page.locator('input[type="url"]')).toBeVisible();
  });
});


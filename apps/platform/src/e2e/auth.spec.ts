import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page).toHaveTitle(/OpenRevenue/);
    await expect(page.locator('h1')).toContainText(/Sign in/i);
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page).toHaveTitle(/OpenRevenue/);
    await expect(page.locator('h1')).toContainText(/Sign up/i);
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    
    // Click register link
    const registerLink = page.locator('a:has-text("Sign up")').first();
    await registerLink.click();
    
    await expect(page).toHaveURL(/\/register/);
  });
});


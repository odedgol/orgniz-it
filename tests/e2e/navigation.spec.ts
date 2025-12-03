import { test, expect } from '@playwright/test';

// Note: These tests assume the user is authenticated
// In a real test suite, you would mock authentication or use a test account

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // For now, just verify the login page loads
    // In production, you'd mock auth or use test credentials
    await page.goto('/login');
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Orgniz-it/);
  });

  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show login page when accessing protected routes', async ({ page }) => {
    const protectedRoutes = ['/day', '/month', '/subjects', '/jobs', '/stats'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Should be redirected to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');

    // Check for main elements
    await expect(page.getByText('Orgniz-it')).toBeVisible();
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
  });

  test('should display feature highlights on login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText('Task Tracking')).toBeVisible();
    await expect(page.getByText('Job Pipeline')).toBeVisible();
    await expect(page.getByText('Streak Motivation')).toBeVisible();
  });
});

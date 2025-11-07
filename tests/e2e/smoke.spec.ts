import { test, expect } from '@playwright/test';

test.describe('Genel smoke testi', () => {
  test('ana sayfa render ediliyor', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});

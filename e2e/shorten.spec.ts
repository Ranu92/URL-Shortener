import { test, expect } from '@playwright/test';

test('shorten a URL and follow the short link', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('URL to shorten').fill('https://example.com/');
  await page.getByRole('button', { name: /shorten/i }).click();

  const link = page.getByRole('link', { name: /http:\/\/localhost:3000\// });
  await expect(link).toBeVisible();

  const href = await link.getAttribute('href');
  expect(href).toBeTruthy();

  await page.goto(href!);
  await expect(page).toHaveURL('https://example.com/');
});

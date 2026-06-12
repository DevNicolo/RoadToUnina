import { test, expect } from '@playwright/test';

test('should show error when registration fields are empty', async ({ page }) => {
  await page.goto('http://192.168.1.235:4200/welcome');
  await page.getByRole('button', { name: 'Registrati' }).click();
  await page.locator('app-auth').getByRole('button', { name: 'Registrati' }).click();
  await expect(page.getByText('Inserisci username e password')).toBeVisible();
});
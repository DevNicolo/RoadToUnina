import { test, expect } from '@playwright/test';

test('should toggle between login and registration forms', async ({ page }) => {
  await page.goto('http://192.168.1.235:4200/welcome');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Registrati ora' }).click();
  await page.getByRole('button', { name: 'Accedi qui' }).click();
  await expect(page.locator('app-auth').getByRole('button', { name: 'Entra nel Gioco' })).toBeVisible();
});
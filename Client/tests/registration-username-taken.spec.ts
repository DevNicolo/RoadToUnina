import { test, expect } from '@playwright/test';

test('should show error when username is already taken', async ({ page }) => {
  await page.goto('http://192.168.1.235:4200/welcome');
  await page.getByRole('button', { name: 'Registrati' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('mario_rossi');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password567');
  await page.locator('app-auth').getByRole('button', { name: 'Registrati' }).click();
  await expect(page.getByText('⚠️ Errore: Username già in uso')).toBeVisible();
});
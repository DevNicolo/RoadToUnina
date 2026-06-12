import { test, expect } from '@playwright/test';

test('should show error on invalid login', async ({ page }) => {
  await page.goto('http://192.168.1.235:4200/welcome');
  await page.getByRole('button', { name: 'Inizia a Giocare 🚀' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('mario_rossi');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password1234');
  await page.getByRole('button', { name: 'Entra nel Gioco' }).click();
  await expect(page.getByText('⚠️ Errore: Credenziali non')).toBeVisible();
});
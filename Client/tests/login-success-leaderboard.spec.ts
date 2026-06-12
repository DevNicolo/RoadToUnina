import { test, expect } from '@playwright/test';

test('should login successfully and view leaderboard', async ({ page }) => {
  await page.goto('http://192.168.1.235:4200/welcome');
  await page.getByRole('button', { name: 'Inizia a Giocare 🚀' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('mario_rossi');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Entra nel Gioco' }).click();
  await page.getByRole('button', { name: '🏆 Classifica' }).click();
  await expect(page.getByRole('heading', { name: '🏆 Hall of Fame' })).toBeVisible();
});
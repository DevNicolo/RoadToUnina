import { test, expect } from '@playwright/test';

test('should register a new user successfully', async ({ page }) => {
  const uniqueUsername = `Luigi_${Date.now()}`;
  
  await page.goto('http://192.168.1.235:4200/welcome');
  await page.getByRole('button', { name: 'Registrati' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill(uniqueUsername);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Starace');
  await page.locator('app-auth').getByRole('button', { name: 'Registrati' }).click();
  await expect(page.getByRole('button', { name: '🚀 Inizia Nuova Partita' })).toBeVisible();
});
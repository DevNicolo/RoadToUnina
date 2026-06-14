import { test, expect } from '@playwright/test';

test('should surrender during a game search', async ({ page }) => {
  // Utente
  const uniqueUsername = `P_${Date.now()}`;
  
  await page.goto('http://192.168.1.235:4200/welcome');
  await page.getByRole('button', { name: 'Registrati' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill(uniqueUsername);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('pass123');
  await page.locator('app-auth').getByRole('button', { name: 'Registrati' }).click();

  await expect(page.getByRole('button', { name: '🚀 Inizia Nuova Partita' })).toBeVisible();
  await page.getByRole('button', { name: '🚀 Inizia Nuova Partita' }).click();

  await expect(page.getByRole('button', { name: '🏳️ Abbandona' })).toBeVisible();

  await page.getByRole('textbox', { name: '🔍 Cerca un collegamento...' }).click();
  await page.getByRole('textbox', { name: '🔍 Cerca un collegamento...' }).fill('abcdefghxyz');
  
  await expect(page.getByRole('button', { name: 'Arrenditi' })).toBeVisible();
  await page.getByRole('button', { name: 'Arrenditi' }).click();

  await expect(page.getByRole('button', { name: '🚀 Inizia Nuova Partita' })).toBeVisible();
});
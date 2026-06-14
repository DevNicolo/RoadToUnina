import { test, expect } from '@playwright/test';

test('should complete a game and return to menu', async ({ page }) => {
  // Mock 
  await page.route('**/api/game/links/*', async route => {
    const json = { success: true, links: ['Università degli Studi di Napoli Federico II'] };
    await route.fulfill({ json });
  });

  // utente
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

  await expect(page.getByRole('button', { name: 'Università degli Studi di Napoli Federico II' })).toBeVisible();
  await page.getByRole('button', { name: 'Università degli Studi di Napoli Federico II' }).click();

  await expect(page.getByRole('heading', { name: '🎉 COMPLIMENTI! 🎉' })).toBeVisible();
});
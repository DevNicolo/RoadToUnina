import { test, expect } from '@playwright/test';

test('should abandon an active game', async ({ page }) => {
  // 1. Crea un utente univoco per isolare il test
  const uniqueUsername = `Player_A_${Date.now()}`;
  
  await page.goto('http://192.168.1.235:4200/welcome');
  await page.getByRole('button', { name: 'Registrati' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill(uniqueUsername);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('pass123');
  await page.locator('app-auth').getByRole('button', { name: 'Registrati' }).click();

  //  Avvia la partita
  await expect(page.getByRole('button', { name: '🚀 Inizia Nuova Partita' })).toBeVisible();
  await page.getByRole('button', { name: '🚀 Inizia Nuova Partita' }).click();
  
  //  bottone abbandona
  await expect(page.getByRole('button', { name: '🏳️ Abbandona' })).toBeVisible();
  await page.getByRole('button', { name: '🏳️ Abbandona' }).click();
  await expect(page.getByRole('button', { name: '🚀 Inizia Nuova Partita' })).toBeVisible();
});
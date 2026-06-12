import { test, expect } from '@playwright/test';

test('should surrender during a game search', async ({ page }) => {
  // 1. Crea un utente univoco
  const uniqueUsername = `Player_S_${Date.now()}`;
  
  await page.goto('http://192.168.1.235:4200/welcome');
  await page.getByRole('button', { name: 'Registrati' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill(uniqueUsername);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('pass123');
  await page.locator('app-auth').getByRole('button', { name: 'Registrati' }).click();

  // 2. Avvia la partita
  await expect(page.getByRole('button', { name: '🚀 Inizia Nuova Partita' })).toBeVisible();
  await page.getByRole('button', { name: '🚀 Inizia Nuova Partita' }).click();
  
  // 3. Aspetta che carichi la pagina Wikipedia iniziale
  await expect(page.getByRole('button', { name: '🏳️ Abbandona' })).toBeVisible();
  
  // 4. Cerca una stringa impossibile per forzare la schermata del vicolo cieco
  await page.getByRole('textbox', { name: '🔍 Cerca un collegamento...' }).click();
  await page.getByRole('textbox', { name: '🔍 Cerca un collegamento...' }).fill('abcdefghxyz');
  
  // 5. Clicca il pulsante di resa che compare nel vicolo cieco
  await expect(page.getByRole('button', { name: 'Arrenditi' })).toBeVisible();
  await page.getByRole('button', { name: 'Arrenditi' }).click();

  // 6. Verifica il ritorno alla home
  await expect(page.getByRole('button', { name: '🚀 Inizia Nuova Partita' })).toBeVisible();
});
import { expect, test } from '@playwright/test';
import { gotoScreen } from '../helpers/panel.js';

test('a pass reward opens its sheet; Esc closes it first and focus returns to the tile', async ({ page }) => {
  await gotoScreen(page, { tab: 'passe' });
  const tile = page.locator('.passe__track [data-item="passe-8"]');
  await tile.click();
  const sheet = page.locator('.rbg-panel > .rbg-sheet');
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('.rbg-sheet__title')).toHaveText('Moldura Azul');
  await expect(sheet).toContainText('Libera com o Passe de Batalha, no nível 8');
  await expect(sheet.locator('[data-sheet-close]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(sheet.getByRole('button', { name: 'Obter o Passe' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(sheet.locator('[data-sheet-close]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(page.locator('.rbg-panel')).toBeVisible();
  await expect(tile).toBeFocused();
});

test('a club reward opens its sheet with the club copy and closes with the button', async ({ page }) => {
  await gotoScreen(page, { tab: 'meu-time', sub: 'conquistas' });
  const tile = page.locator('[data-item="clube-nivel-15"]');
  await tile.click();
  const sheet = page.locator('.rbg-sheet');
  await expect(sheet).toContainText('Entrada, nível 15');
  await expect(sheet).toContainText('Recompensa do clube');
  await expect(sheet).toContainText('Ainda bloqueado');
  await sheet.locator('[data-sheet-close]').click();
  await expect(sheet).toHaveCount(0);
  await expect(tile).toBeFocused();
});

test('a free pass reward requires its level without offering a pass purchase', async ({ page }) => {
  await gotoScreen(page, { tab: 'passe' });
  const tile = page.locator('.passe__track [data-item="passe-10"]');
  await tile.click();
  const sheet = page.locator('.rbg-sheet');
  await expect(sheet.locator('.rbg-sheet__title')).toHaveText('Banner Holográfico');
  await expect(sheet.locator('.rbg-sheet__unlock')).toHaveText('Libera grátis no nível 10');
  await expect(sheet.getByRole('button', { name: 'Obter o Passe' })).toHaveCount(0);
  await expect(sheet.locator('[data-sheet-close]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(sheet.locator('[data-sheet-close]')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(sheet.locator('[data-sheet-close]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(page.locator('.rbg-panel')).toBeVisible();
  await expect(tile).toBeFocused();
});

test('a shop item opens the for-sale sheet with its prices, buy and gift actions', async ({ page }, testInfo) => {
  await gotoScreen(page, { tab: 'loja' });
  const tile = page.locator('[data-item="loja-banner-vulcao"]');
  await tile.click();
  const sheet = page.locator('.rbg-sheet');
  await expect(sheet.locator('.rbg-sheet__price')).toHaveText('R$ 1,99 (€ 1,49, US$ 1.49)');
  await expect(sheet.getByRole('button', { name: 'Comprar por R$ 1,99' })).toBeVisible();
  await expect(sheet.locator('.rbg-sheet__banner-identity')).toContainText('Jogador 01');
  if (['size-1024', 'shrunk'].includes(testInfo.project.name)) {
    const preview = await sheet.locator('.rbg-sheet__art').boundingBox();
    expect(preview.height).toBeLessThanOrEqual(64);
    const giftRowFits = await sheet.locator('.rbg-sheet__gift').evaluate((gift) => {
      const box = gift.getBoundingClientRect();
      const sheetBox = gift.closest('.rbg-sheet').getBoundingClientRect();
      return box.top >= sheetBox.top && box.bottom <= sheetBox.bottom;
    });
    expect(giftRowFits).toBe(true);
  }
  await expect(sheet.getByLabel('Presentear: nome do amigo')).toBeVisible();
  await sheet.getByLabel('Presentear: nome do amigo').scrollIntoViewIfNeeded();
  await expect(sheet.getByLabel('Presentear: nome do amigo')).toBeInViewport();
  await expect(sheet.getByRole('button', { name: 'Presentear', exact: true })).toBeInViewport();
  await sheet.getByRole('button', { name: 'Comprar por R$ 1,99' }).click();
  await expect(page.locator('#rbg-status')).toHaveText('Comprar Banner Vulcão: ainda não está no protótipo.');
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(tile).toBeFocused();
});

test('the pass separates the season goal from the next unlock and preserves both detail actions', async ({ page }) => {
  await gotoScreen(page, { tab: 'passe' });
  const final = page.locator('.passe__final');
  await expect(final).toContainText('MVP do Dragão');
  await expect(final).toContainText(/nível\s+50/i);
  await expect(final).toContainText('Ver recompensa');
  await expect(page.locator('.passe__track [data-item="passe-48"]')).toBeAttached();
  await expect(page.locator('.passe__track [data-item="passe-49"]')).toBeAttached();
  await expect(page.locator('.passe__next')).toContainText('Moldura Azul');
  await expect(page.getByRole('progressbar', { name: 'XP do nível', exact: true })).toHaveAttribute('value', '455');
  await final.click();
  await expect(page.locator('.rbg-sheet')).toContainText('Libera com o Passe de Batalha, no nível 50');
  await page.keyboard.press('Escape');
  await expect(final).toBeFocused();
  await page.locator('.passe__next').click();
  await expect(page.locator('.rbg-sheet__title')).toHaveText('Moldura Azul');
});

test('pass hero handles a long reward name and missing art with keyboard actions', async ({ page }) => {
  await page.route('**/assets/items/**', (route) => route.abort());
  await gotoScreen(page, { tab: 'passe' });
  await page.evaluate(async () => {
    const { pass } = await import('/src/data/pass.js');
    pass.track.find((reward) => reward.level === pass.levels).name = 'MVP do Dragão '.repeat(5).trim();
  });
  await page.getByRole('tab', { name: 'Ranking', exact: true }).click();
  await page.getByRole('tab', { name: 'Passe de Batalha Novo', exact: true }).click();

  const final = page.locator('.passe__final');
  await expect(final.locator('.rbg-art__missing')).toContainText('MVP do Dragão');
  await expect(page.locator('.rbg-view')).toHaveJSProperty(
    'scrollWidth',
    await page.locator('.rbg-view').evaluate((el) => el.clientWidth),
  );
  await final.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.rbg-sheet')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(final).toBeFocused();

  for (const label of ['Obter o Passe', 'Copiar link']) {
    await page.getByRole('button', { name: label, exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#rbg-status')).toContainText(`${label}: ainda não está no protótipo.`);
  }
});

test('rarity follows reward data and never the reward name or level', async ({ page }) => {
  await gotoScreen(page, { tab: 'passe' });
  const epic = page.locator('.passe__track [data-item="passe-15"]');
  await expect(epic.locator('[data-rarity]')).toHaveAttribute('data-rarity', 'épica');
  await expect(epic).toContainText('Épica');
  await epic.click();
  await expect(page.locator('.rbg-sheet__art')).toHaveAttribute('data-rarity', 'épica');
  await expect(page.locator('.rbg-sheet__head')).toContainText('Épica');
  await page.keyboard.press('Escape');
  const unknown = page.locator('.passe__track [data-item="passe-48"]');
  await expect(unknown).toContainText('Moldura Lendária');
  await expect(unknown.locator('[data-rarity]')).toHaveAttribute('data-rarity', '');
  await unknown.click();
  await expect(page.locator('.rbg-sheet__art')).toHaveAttribute('data-rarity', '');
  await expect(page.locator('.rbg-sheet__head .rbg-tag')).toHaveCount(0);
});

test('shop rarity remains readable and matches the item detail', async ({ page }) => {
  await gotoScreen(page, { tab: 'loja' });
  for (const [id, label, rarity] of [
    ['loja-escuta-aqui', 'Lendária', 'lendária'],
    ['loja-mvp-cinturao', 'Épica', 'épica'],
    ['loja-banner-vulcao', 'Rara', 'rara'],
  ]) {
    const item = page.locator(`[data-item="${id}"]`);
    await expect(item).toContainText(label);
    await expect(item.locator('[data-rarity]')).toHaveAttribute('data-rarity', rarity);
    await item.click();
    await expect(page.locator('.rbg-sheet__head')).toContainText(label);
    await expect(page.locator('.rbg-sheet__art')).toHaveAttribute('data-rarity', rarity);
    await page.keyboard.press('Escape');
    await expect(item).toBeFocused();
  }
});

test('long shop names and missing art preserve the price and purchase action', async ({ page }) => {
  await page.route('**/assets/items/**', (route) => route.abort());
  await gotoScreen(page, { tab: 'ranking', sub: 'jogadores' });
  await page.getByRole('tab', { name: 'Loja Novo', exact: true }).click();
  const item = page.locator('[data-item="loja-escuta-aqui"]');
  const longName = 'Banner Chuva de ouro '.repeat(5).trim();
  await item.locator('.loja__name').evaluate((node, name) => {
    node.textContent = name;
  }, longName);
  await item.locator('.rbg-art__missing').evaluate((node, name) => {
    node.textContent = `[${name}]`;
  }, longName);
  await expect(item.locator('.rbg-art__missing')).toContainText('Banner Chuva de ouro');
  await expect(item.locator('.loja__price')).toHaveText('R$ 5,49');
  await expect(page.locator('.rbg-view')).toHaveJSProperty(
    'scrollWidth',
    await page.locator('.rbg-view').evaluate((el) => el.clientWidth),
  );
  await item.click();
  await expect(page.locator('.rbg-sheet__art')).toHaveAttribute('data-rarity', 'lendária');
  await expect(page.locator('.rbg-sheet').getByRole('button', { name: 'Comprar por R$ 5,49' })).toBeVisible();
});

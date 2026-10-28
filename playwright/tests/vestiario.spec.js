import { expect, test } from '@playwright/test';
import { gotoScreen } from '../helpers/panel.js';

test('saving a number updates the kit number and announces it', async ({ page }) => {
  await gotoScreen(page, { tab: 'vestiario', sub: 'numero' });
  await page.locator('.vestiario__number', { hasText: /^7$/ }).click();
  await page.locator('[data-save-number]').click();
  await expect(page.locator('.rbg-stage__kit')).toContainText('7');
  await expect(page.locator('#rbg-status')).toHaveText('Número 7 salvo.');
  await expect(page.locator('[data-save-number]')).toBeFocused();
});

test('the equip picker previews a selection and equips it on demand', async ({ page }) => {
  await gotoScreen(page, { tab: 'vestiario', sub: 'pose-mvp' });
  await expect(page.locator('[data-equip]')).toHaveCount(0);
  const stage = page.locator('.rbg-stage[data-preview] img');
  await expect(stage).not.toHaveAttribute('alt', /^Avatar de/);
  await page.locator('.equip__tile', { hasText: 'Nenhum' }).click();
  await expect(page.locator('.equip__name')).toHaveText('Nenhum');
  await expect(stage).toHaveAttribute('alt', /^Avatar de/);
  await expect(page.locator('[data-equip]')).toHaveText('Equipar');
  await page.locator('[data-equip]').click();
  await expect(page.locator('#rbg-status')).toHaveText('Sem pose de mvp equipado.');
  await expect(page.locator('[data-equip]')).toHaveCount(0);
  await expect(page.locator('.equip__tile input[value="nenhum"]')).toBeFocused();
});

test('equipment buttons open details and back returns focus to the matching button', async ({ page }) => {
  await gotoScreen(page, { tab: 'vestiario' });
  await expect(page.locator('.rbg-subtabs')).toBeHidden();

  for (const sub of ['numero', 'chuteira', 'pose-mvp', 'comemoracao']) {
    const slot = page.locator(`#vestiario-slot-${sub}`);
    await slot.click();
    await expect(page.locator('.rbg-view')).toHaveAttribute('data-sub', sub);
    await expect(page.locator('[data-sub-back]')).toBeFocused();
    await page.locator('[data-sub-back]').click();
    await expect(page.locator('.rbg-view')).toHaveAttribute('data-sub', 'vestiario-overview');
    await expect(slot).toBeFocused();
  }
});

test('direct detail URLs open the equipment overview', async ({ page }) => {
  for (const sub of ['numero', 'chuteira', 'pose-mvp', 'comemoracao']) {
    await page.goto(`/?tab=vestiario&sub=${sub}`);
    await expect(page.locator('.rbg-view')).toHaveAttribute('data-sub', 'vestiario-overview');
    await expect(page.locator('.rbg-subtabs')).toBeHidden();
  }
});

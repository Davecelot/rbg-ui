import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { gotoScreen, layoutProblems } from '../helpers/panel.js';

const SELF_CHECK = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../.agents/skills/a11y-checker/scripts/a11y-self-check.js',
);

test('profile customization is an in-view destination with a back path', async ({ page }) => {
  await gotoScreen(page, { tab: 'perfil' });
  const nameRow = page.locator('.perfil__name-row');
  const trigger = nameRow.getByRole('button', { name: 'Personalizar perfil' });
  await expect(trigger).toBeVisible();
  await expect(nameRow.getByRole('heading', { name: 'Jogador 01' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Personalizar lobby' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Editar identidade' })).toHaveCount(0);
  await trigger.click();

  const customize = page.locator('.profile-customize');
  const banner = customize.locator('[data-profile-section="banner"]');
  await expect(customize).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Personalizar perfil' })).toHaveCount(0);
  await expect(customize.getByRole('tab')).toHaveCount(0);
  await expect(customize.locator('input[name="profile-customization-group"][value="banner"]')).toBeChecked();
  await expect(banner).toBeVisible();
  await expect(banner.getByRole('heading', { name: 'Banner Gramado' })).toBeVisible();
  await expect(banner.getByText('O fundo do seu perfil, para quem abre.')).toBeVisible();

  await customize.getByRole('button', { name: 'Voltar ao perfil' }).click();
  await expect(page.locator('.profile-customize')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Personalizar perfil' })).toBeFocused();
});

test('profile customization filters are keyboard-operable and show their previews', async ({ page }) => {
  await gotoScreen(page, { tab: 'perfil' });
  await page.getByRole('button', { name: 'Personalizar perfil' }).click();
  const customize = page.locator('.profile-customize');
  const filters = customize.locator('.profile-customize__filters');
  const bannerFilter = filters.locator('input[value="banner"]');
  const frameFilter = filters.locator('input[value="moldura"]');
  const cardFilter = filters.locator('input[value="card"]');
  const banner = customize.locator('[data-profile-section="banner"]');
  const frame = customize.locator('[data-profile-section="moldura"]');
  const card = customize.locator('[data-profile-section="card"]');

  await bannerFilter.focus();
  await page.keyboard.press('ArrowRight');
  await expect(frameFilter).toBeFocused();
  await expect(frameFilter).toBeChecked();
  await expect(frame).toBeVisible();
  await expect(frame.getByRole('heading', { name: 'Nenhum' })).toBeVisible();
  await expect(
    frame.getByText('Você ainda não tem nenhum item deste tipo. Libere na trilha do Passe de Batalha.'),
  ).toBeVisible();

  await page.keyboard.press('ArrowLeft');
  await expect(bannerFilter).toBeFocused();
  await expect(banner).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(cardFilter).toBeFocused();
  await expect(card).toBeVisible();
  await expect(card.getByRole('heading', { name: 'Card Prata' })).toBeVisible();
  await expect(
    card.getByText('Aparece no placar, para todos, quando você marca um gol, e no seu perfil.'),
  ).toBeVisible();
});

test('profile item changes stay in the view and announce the equipment state', async ({ page }) => {
  await gotoScreen(page, { tab: 'perfil' });
  await page.getByRole('button', { name: 'Personalizar perfil' }).click();
  const customize = page.locator('.profile-customize');
  await customize.locator('.profile-customize__filters label').filter({ hasText: 'Card' }).click();
  const card = customize.locator('[data-profile-section="card"]');
  await card.locator('.equip__tile', { hasText: 'Nenhum' }).click();
  await expect(card.getByRole('button', { name: 'Equipar' })).toBeVisible();
  await card.getByRole('button', { name: 'Equipar' }).click();
  await expect(page.locator('#rbg-status')).toHaveText('Sem card equipado.');
  await expect(card).toBeVisible();
  await expect(card.locator('.equip__tile input[value="nenhum"]')).toBeChecked();
  await expect(card.getByText('Sem card equipado.')).toBeVisible();
});

test('Escape returns from customization without closing the panel', async ({ page }) => {
  await gotoScreen(page, { tab: 'perfil' });
  await page.getByRole('button', { name: 'Personalizar perfil' }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.profile-customize')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Personalizar perfil' })).toBeFocused();
  await expect(page.locator('.rbg-panel')).toBeVisible();
});

test('customization stays in the view without covering the shell', async ({ page }) => {
  await gotoScreen(page, { tab: 'perfil' });
  await page.getByRole('button', { name: 'Personalizar perfil' }).click();
  const customize = page.locator('.rbg-view > .profile-customize');
  await expect(customize).toHaveCount(1);
  await expect(page.getByRole('tablist', { name: 'Seções' }).getByRole('tab', { name: 'Perfil' })).toBeVisible();
  await expect(page.locator('.rbg-actionbar')).toBeVisible();
  expect(await layoutProblems(page)).toEqual([]);
  const caption = customize.locator('.profile-customize__preview-caption');
  await caption.scrollIntoViewIfNeeded();
  await expect(caption).toBeInViewport();
  const status = customize.locator('[data-profile-section="banner"] .equip__status');
  await status.scrollIntoViewIfNeeded();
  await expect(status).toBeInViewport();
});

test('customization view has no HIGH-impact accessibility failures', async ({ page }) => {
  await page.addInitScript(() => (window.A11Y_SELF_CHECK_HEADLESS = true));
  await gotoScreen(page, { tab: 'perfil' });
  await page.getByRole('button', { name: 'Personalizar perfil' }).click();
  await page.addScriptTag({ path: SELF_CHECK });
  const failures = await page.evaluate(async () => {
    const results = await window.A11ySelfCheck.run({ reflow: false });
    return results.results.filter((item) => item.status === 'fail' && item.impact === 'HIGH');
  });
  expect(failures).toEqual([]);
});

test('capture profile customization filters for visual review', async ({ page }, testInfo) => {
  test.skip(!process.env.WALKTHROUGH, 'Set WALKTHROUGH=1 to capture customization filters.');
  await gotoScreen(page, { tab: 'perfil' });
  await page.getByRole('button', { name: 'Personalizar perfil' }).click();
  const folder = `test-results/walkthrough/${testInfo.project.name}`;
  const customize = page.locator('.profile-customize');
  for (const section of ['Banner', 'Card', 'Moldura']) {
    const filter = customize.locator(`input[name="profile-customization-group"][value="${section.toLowerCase()}"]`);
    await filter.locator('..').click();
    await page.locator('.rbg-view').evaluate((view) => {
      view.scrollTop = 0;
    });
    const group = customize.locator(`[data-profile-section="${section.toLowerCase()}"]`);
    await group
      .locator('.equip__preview img')
      .evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
    await group.locator('.equip__tile img').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
    await page.screenshot({ path: `${folder}/perfil--customizar-${section.toLowerCase()}.png` });
  }
});

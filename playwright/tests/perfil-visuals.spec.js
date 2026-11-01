import { expect, test } from '@playwright/test';
import { gotoScreen, layoutProblems, settle } from '../helpers/panel.js';

test('profile presentation switches with the keyboard and remembers the choice', async ({ page }) => {
  await gotoScreen(page, { tab: 'perfil' });
  const toggle = page.getByRole('button', { name: 'Exibir card', exact: true });
  await settle(page);
  const surface = page.locator('.perfil__visuals');
  const footprint = await surface.boundingBox();
  const scroll = await page.locator('.rbg-view').evaluate((view) => ({
    height: view.scrollHeight,
    width: view.scrollWidth,
    clientWidth: view.clientWidth,
  }));
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toBeFocused();
  await expect(page.locator('.perfil__character')).toBeHidden();
  await expect(page.locator('.perfil__card')).toBeVisible();
  await expect(page.getByRole('button', { name: /Girar avatar para/ })).toHaveCount(0);
  expect(await page.locator('.perfil__character').evaluate((element) => element.inert)).toBe(true);
  await expect(page.locator('.perfil__card')).not.toContainText('Prata IV');
  await expect(page.locator('.perfil__card')).not.toContainText('Jogador 01');
  await expect(page.locator('.perfil__card')).not.toContainText('24 / 100 PDL');
  await expect(page.locator('.perfil__card').getByRole('button', { name: 'Vestiário' })).toBeVisible();
  expect(await surface.boundingBox()).toEqual(footprint);
  expect(
    await page.locator('.rbg-view').evaluate((view) => ({
      height: view.scrollHeight,
      width: view.scrollWidth,
      clientWidth: view.clientWidth,
    })),
  ).toEqual(scroll);
  expect(await layoutProblems(page)).toEqual([]);
  await page.reload();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.perfil__card')).toBeVisible();
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(toggle).toBeFocused();
  await expect(page.getByRole('button', { name: 'Girar avatar para a direita' })).toBeVisible();
});

test('equipped banner and card update the Lobby and handle removing items', async ({ page }) => {
  await gotoScreen(page, { tab: 'perfil' });
  await page.getByRole('button', { name: 'Exibir card', exact: true }).click();
  await page.getByRole('button', { name: 'Personalizar perfil', exact: true }).click();
  const banner = page.locator('[data-profile-section="banner"]');
  await banner
    .getByRole('radio', { name: /Nenhum/ })
    .locator('..')
    .click();
  await banner.getByRole('button', { name: 'Equipar', exact: true }).click();
  await page.getByRole('button', { name: 'Voltar ao perfil' }).click();
  await expect(page.locator('.perfil__banner')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Exibir card', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Personalizar perfil', exact: true }).click();
  await banner
    .getByRole('radio', { name: /Banner Gramado/ })
    .locator('..')
    .click();
  await banner.getByRole('button', { name: 'Equipar', exact: true }).click();
  await page.locator('input[name="profile-customization-group"][value="card"]').locator('..').click();
  const cards = page.locator('[data-profile-section="card"]');
  await cards
    .getByRole('radio', { name: /Nenhum/ })
    .locator('..')
    .click();
  await cards.getByRole('button', { name: 'Equipar', exact: true }).click();
  await page.getByRole('button', { name: 'Voltar ao perfil' }).click();
  await expect(page.locator('.perfil__character .perfil__banner img')).toHaveAttribute('alt', 'Banner Gramado');
  await expect(page.getByRole('button', { name: 'Exibir card', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'Exibir card', exact: true })).toBeDisabled();
  await expect(page.getByText('Equipe um card em Personalizar perfil.')).toBeVisible();
  await expect(page.locator('.perfil__character')).toBeVisible();
});

test('capture profile visuals', async ({ page }, testInfo) => {
  test.skip(!process.env.WALKTHROUGH, 'Set WALKTHROUGH=1 to capture profile visuals.');
  await gotoScreen(page, { tab: 'perfil' });
  const toggle = page.getByRole('button', { name: 'Exibir card', exact: true });
  for (const value of ['character', 'card']) {
    if ((await toggle.getAttribute('aria-pressed')) !== String(value === 'card')) await toggle.click();
    await settle(page);
    await page.screenshot({ path: `test-results/walkthrough/${testInfo.project.name}/perfil-visuals--${value}.png` });
  }
});

test('owned banner and card options apply distinct artwork to the profile', async ({ page }, testInfo) => {
  await gotoScreen(page, { tab: 'perfil' });
  for (const [group, options] of [
    [
      'banner',
      [
        ['Banner Estádio', 'banner-2.png'],
        ['Banner Noite', 'banner-7.png'],
        ['Banner Gramado', 'banner-0.png'],
      ],
    ],
    [
      'card',
      [
        ['Card Ouro', 'card-7.png'],
        ['Card Lenda', 'card-6.png'],
        ['Card Prata', 'card-0.png'],
      ],
    ],
  ]) {
    for (const [name, file] of options) {
      await page.getByRole('button', { name: 'Personalizar perfil', exact: true }).click();
      await page.locator(`input[name="profile-customization-group"][value="${group}"]`).locator('..').click();
      const section = page.locator(`[data-profile-section="${group}"]`);
      await section
        .getByRole('radio', { name: new RegExp(name) })
        .locator('..')
        .click();
      await section.getByRole('button', { name: 'Equipar', exact: true }).click();
      await page.getByRole('button', { name: 'Voltar ao perfil' }).click();
      if (group === 'card') {
        const toggle = page.getByRole('button', { name: 'Exibir card', exact: true });
        if ((await toggle.getAttribute('aria-pressed')) !== 'true') await toggle.click();
      }
      const art = page.locator(
        group === 'card' ? '.perfil__card > img.rbg-art' : '.perfil__character .perfil__banner img',
      );
      await expect(art).toHaveAttribute('alt', name);
      await expect(art).toHaveAttribute('src', new RegExp(`${file}$`));
      expect(await layoutProblems(page)).toEqual([]);
      if (process.env.WALKTHROUGH) {
        await settle(page);
        await page.screenshot({ path: `test-results/walkthrough/${testInfo.project.name}/perfil-equipped--${file}` });
      }
    }
  }
});

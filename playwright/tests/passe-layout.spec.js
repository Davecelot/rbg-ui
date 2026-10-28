import { expect, test } from '@playwright/test';
import { gotoScreen } from '../helpers/panel.js';

test('code redemption follows the hero and stays keyboard accessible', async ({ page }, testInfo) => {
  await gotoScreen(page, { tab: 'passe' });

  const hero = page.locator('.passe__hero');
  const redeem = page.locator('.passe__buy');
  await expect(redeem).toBeVisible();
  expect(await hero.evaluate((node) => node.nextElementSibling.matches('.passe__buy'))).toBe(true);
  await expect(redeem.getByRole('heading', { name: 'Já pagou?' })).toBeVisible();
  const scrollHint = redeem.getByText('Role para digitar o código');
  if (['size-1024', 'shrunk'].includes(testInfo.project.name)) await expect(scrollHint).toBeVisible();
  else await expect(scrollHint).toBeHidden();

  const code = page.getByLabel('Digite o código');
  const submit = redeem.getByRole('button', { name: 'Resgatar' });
  await expect(code).toHaveAttribute('placeholder', 'ex.: PASS-CODE');
  await page.getByRole('button', { name: 'Copiar link' }).focus();
  await page.keyboard.press('Tab');
  await expect(code).toBeFocused();
  await expect(code).toBeInViewport();
  await page.keyboard.press('Tab');
  await expect(submit).toBeFocused();
  await expect(submit).toBeInViewport();

  await expect(page.getByText('Última partida', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Partida jogada', { exact: true })).toHaveCount(0);
});

test('profile keeps the battle pass lifetime XP total', async ({ page }) => {
  await gotoScreen(page, { tab: 'perfil' });
  await expect(page.getByText('8.320 XP no total, Temporada 1', { exact: true })).toBeVisible();
});

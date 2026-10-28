import { expect, test } from '@playwright/test';
import { gotoScreen } from '../helpers/panel.js';

const cta = '.rbg-actionbar [data-action=primary]';

test('Fila presents the RCS play panel and its locked action', async ({ page }) => {
  await gotoScreen(page, { tab: 'rcs-week', sub: 'fila', state: 'locked' });
  await expect(page.getByRole('heading', { name: 'Jogar RCS Week' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Seu clube precisa estar inscrito e aprovado na RCS Week para jogar.' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar na fila RCS' })).toHaveAttribute('aria-disabled', 'true');
  const registration = page.getByRole('button', { name: 'Ver inscrições da RCS Week' });
  await expect(registration).toHaveClass(/rbg-button/);
  await registration.click();
  await expect(page.locator('.rbg-view')).toHaveAttribute('data-sub', 'inscricoes');
});

test('Fila presents the ready lineup and keeps its existing pending action', async ({ page }) => {
  await gotoScreen(page, { tab: 'rcs-week', sub: 'fila' });
  await expect(page.getByRole('heading', { name: 'Jogar RCS Week' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Clube Alfa, escalação pronta' })).toBeVisible();
  await expect(page.locator('.rcs__lineup li')).not.toHaveCount(0);
  await expect(page.locator(cta)).toHaveText('Entrar na fila RCS');
  await page.locator(cta).click();
  await expect(page.locator('#rbg-status')).toHaveText('Entrar na fila RCS: ainda não está no protótipo.');
});

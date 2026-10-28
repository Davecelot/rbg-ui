import { expect, test } from '@playwright/test';
import { gotoScreen } from '../helpers/panel.js';
import { playerRanking } from '../../src/data/ranking.js';
import { tiers } from '../../src/data/ranks.js';
import { rankBadge, rankName } from '../../src/screens/rank-badge.js';

test('Bronze and unranked crests center their insignia', () => {
  for (const [tier, offset] of [
    ['bronze', -5],
    ['unranked', -5],
    ['esmeralda', -3],
    ['fenomeno', -3],
  ]) {
    expect(rankBadge(tier)).toContain(`<g transform="translate(0 ${offset})">`);
  }
  expect(rankName('unranked')).toBe('Sem classificação');
});

test('ranking preserves player and club identity slots alongside names and Elo', async ({ page }) => {
  await gotoScreen(page, { tab: 'ranking', sub: 'jogadores' });
  const topPlayer = page.getByRole('row', { name: /Jogador 13/ });
  await expect(topPlayer.locator('[data-slot="avatar"] img')).toBeVisible();
  await expect(topPlayer).toContainText('Passe T1');
  await expect(topPlayer.locator('[data-tier="platina"]')).toBeVisible();
  await expect(topPlayer.locator('.rbg-rank-badge__division')).toHaveText('II');
  await expect(page.getByRole('row', { name: /Jogador 19/ }).locator('.rbg-rank-badge')).toHaveAttribute(
    'data-echelon',
    'apex',
  );
  for (const name of ['Jogador 19', 'Jogador 20', 'Jogador 21', 'Jogador 22', 'Jogador 23']) {
    await expect(page.getByRole('row', { name: new RegExp(name) })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
  const self = page.getByRole('row', { name: /Jogador 01/ });
  await expect(self.locator('[data-tier="prata"]')).toBeVisible();
  await expect(self).toContainText('Prata IV');
  await page.getByRole('tab', { name: 'Times', exact: true }).click();
  await expect(page.getByRole('row', { name: /Clube Gama/ }).locator('[data-slot="crest"] img')).toBeVisible();
  await page.getByRole('tab', { name: 'Perfil', exact: true }).first().click();
  await expect(page.locator('.perfil__elo [data-tier="prata"]')).toBeVisible();
  await expect(page.locator('.perfil__tier')).toHaveText('Prata IV');
});

test('ranking paginates every position locally and keeps keyboard focus', async ({ page }) => {
  await gotoScreen(page, { tab: 'ranking', sub: 'jogadores' });
  const rows = page.locator('.ranking tbody tr');
  await expect(rows).toHaveCount(36);
  await expect(rows.first().locator('td').first()).toHaveText('1');
  await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
  await expect(rows.first().locator('td').first()).toHaveText('37');
  await expect(page.getByRole('button', { name: 'Próxima página', exact: true })).toBeFocused();
  await expect(page.locator('#rbg-status')).toHaveText('Página 2 de 4');
  await page.getByRole('button', { name: 'Última página', exact: true }).click();
  await expect(rows.last().locator('td').first()).toHaveText('143');
  await expect(page.getByRole('button', { name: 'Próxima página', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await page.getByRole('button', { name: 'Primeira página', exact: true }).click();
  await expect(rows.first().locator('td').first()).toHaveText('1');
});

test('example ranking rows never place a lower elo above a higher one', () => {
  const divisions = { IV: 0, III: 1, II: 2, I: 3 };
  const score = (row) => {
    const index = tiers.findIndex((tier) => tier.id === row.tierId);
    const division = divisions[row.division] ?? 0;
    return index * 1000 + division * 100 + row.pdl;
  };
  expect(new Set(playerRanking.rows.map((row) => row.tierId))).toEqual(new Set(tiers.map((tier) => tier.id)));
  playerRanking.rows.slice(1).forEach((row, i) => expect(score(row)).toBeLessThanOrEqual(score(playerRanking.rows[i])));
});

test('apex crest movement is disabled when reduced motion is preferred', async ({ page }, testInfo) => {
  await gotoScreen(page, { tab: 'ranking', sub: 'jogadores' });
  const crest = page.getByRole('row', { name: /Jogador 19/ }).locator('.rbg-rank-badge__crest');
  if (testInfo.project.name === 'reduced-motion') {
    await expect(crest).toHaveCSS('animation-name', 'none');
  } else {
    await expect(crest).toHaveCSS('animation-name', 'rbg-rank-crest-enter');
  }
});

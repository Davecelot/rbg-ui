import { expect, test } from '@playwright/test';
import { gotoScreen } from '../helpers/panel.js';
import { pass } from '../../src/data/pass.js';

test('mission categories show one ordered list and preserve keyboard focus', async ({ page }) => {
  await gotoScreen(page, { tab: 'passe' });
  const radios = page.getByRole('radio');
  const daily = page.getByRole('radio', { name: 'Diárias' });
  const weekly = page.getByRole('radio', { name: 'Semanais' });
  const season = page.getByRole('radio', { name: 'Temporada' });
  await expect(radios).toHaveCount(3);
  await expect(daily).toBeChecked();
  await expect(page.locator('[data-mission-group="diarias"]')).toBeVisible();
  await expect(page.locator('[data-mission-group="semanais"]')).toBeHidden();
  await expect(page.locator('[data-mission-group="temporada"]')).toBeHidden();
  await expect(page.locator('[data-mission-group="diarias"] .passe__note')).toContainText('740');

  for (const group of pass.missions) {
    const control = { diarias: daily, semanais: weekly, temporada: season }[group.id];
    await control.locator('..').click();
    const section = page.locator(`[data-mission-group="${group.id}"]`);
    await expect(section).toBeVisible();
    const ordered = [...group.items.filter((m) => m.done < m.goal), ...group.items.filter((m) => m.done === m.goal)];
    await expect(section.locator('.passe__mission-name')).toHaveText(
      ordered.map((m) => `${m.name}${m.tag ? ` ${m.tag}` : ''}`),
    );
    await expect(section.locator('.passe__mission-xp')).toHaveCount(group.items.length);
    await expect(section.getByRole('progressbar')).toHaveCount(group.items.length);
  }
  await daily.focus();
  await page.keyboard.press('ArrowRight');
  await expect(weekly).toBeChecked();
  await expect(weekly).toBeFocused();
  await expect(weekly.locator('..').locator('span')).toHaveCSS('outline-style', 'solid');
  await expect(page.locator('[data-mission-group="diarias"]')).toBeHidden();
  await expect(page.locator('[data-mission-group="semanais"]')).toBeVisible();
  await expect(page.getByText('As missões diárias em aberto valem', { exact: false })).toBeHidden();
  await page.getByRole('tab', { name: 'Ranking', exact: true }).click();
  await page.getByRole('tab', { name: 'Passe de Batalha Novo', exact: true }).click();
  await expect(daily).toBeChecked();
});

test('mission categories handle unknown, empty, and all-complete data', async ({ page }) => {
  await gotoScreen(page, { tab: 'passe' });
  await page.evaluate(async () => {
    const loaded = performance
      .getEntriesByType('resource')
      .findLast((entry) => /\/src\/data\/pass\.js(?:\?|$)/.test(entry.name));
    const { pass } = await import(loaded?.name ?? '/src/data/pass.js');
    delete pass.missions[0].items[0].done;
    pass.missions[1].items = [];
    pass.missions[2].items.forEach((mission) => (mission.done = mission.goal));
  });
  await page.getByRole('tab', { name: 'Ranking', exact: true }).click();
  await page.getByRole('tab', { name: 'Passe de Batalha Novo', exact: true }).click();
  const daily = page.locator('[data-mission-group="diarias"]');
  await expect(daily.getByRole('heading', { name: 'Progresso não informado' })).toBeVisible();
  await expect(daily.getByText('[progresso não capturado]')).toBeVisible();
  await expect(daily.getByText('As missões diárias em aberto valem', { exact: false })).toHaveCount(0);
  await page.getByRole('radio', { name: 'Semanais' }).locator('..').click();
  await expect(page.getByText('Nenhuma missão disponível.')).toBeVisible();
  await page.getByRole('radio', { name: 'Temporada' }).locator('..').click();
  const season = page.locator('[data-mission-group="temporada"]');
  await expect(season.getByText('Nenhuma missão em aberto.')).toBeVisible();
  await expect(season.getByRole('heading', { name: 'Completas' })).toBeVisible();
});

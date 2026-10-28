import { expect, test } from '@playwright/test';
import { everyScreen, gotoScreen, settle } from '../helpers/panel.js';

test.skip(!process.env.WALKTHROUGH, 'Set WALKTHROUGH=1 to capture every tab × sub × state for review.');

test('capture every screen state', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  for (const screen of everyScreen()) {
    await gotoScreen(page, screen);
    await settle(page);
    const name = `${screen.tab}--${screen.sub}--${screen.state}.png`;
    await page.screenshot({ path: `test-results/walkthrough/${testInfo.project.name}/${name}` });
  }
});

test('capture active search, locked modes, and all Elo identifiers', async ({ page }, testInfo) => {
  const folder = `test-results/walkthrough/${testInfo.project.name}`;
  await gotoScreen(page, { tab: 'jogar', sub: 'ranqueada-solo' });
  await page.getByRole('button', { name: 'Entrar na fila', exact: true }).click();
  await settle(page);
  await page.screenshot({ path: `${folder}/jogar--ranqueada-solo--searching.png` });
  await page.getByRole('tab', { name: 'Ranking', exact: true }).click();
  await settle(page);
  await page.screenshot({ path: `${folder}/ranking--jogadores--searching.png` });
  await page.getByRole('button', { name: 'Sair da fila', exact: true }).click();
  await page.getByRole('tab', { name: 'Jogar', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Jogar', exact: true })).toHaveAttribute('aria-selected', 'true');
  await settle(page);
  await page.screenshot({ path: `${folder}/jogar--picker.png` });
  await page.locator('.jogar__mode', { hasText: 'Amistosos' }).click();
  await page.locator('.rbg-actionbar [data-action=primary]').click();
  await settle(page);
  await page.screenshot({ path: `${folder}/jogar--amistosos.png` });
  await gotoScreen(page, { tab: 'jogar', sub: 'modo' });
  await page.locator('.jogar__mode', { hasText: 'Ranqueada Solo' }).click();
  await page.locator('.rbg-actionbar [data-action=primary]').click();
  await settle(page);
  await page.screenshot({ path: `${folder}/jogar--ranqueada-solo.png` });
  await gotoScreen(page, { tab: 'rcs-week', sub: 'fila', state: 'locked' });
  await settle(page);
  await page.screenshot({ path: `${folder}/rcs-week--fila--locked.png` });
  await gotoScreen(page, { tab: 'rcs-week', sub: 'fila' });
  await settle(page);
  await page.screenshot({ path: `${folder}/rcs-week--fila--ready.png` });
  await page.evaluate(async () => {
    const { tiers } = await import('/src/data/ranks.js');
    const { rankBadge, rankName } = await import('/src/screens/rank-badge.js');
    document.querySelector('.rbg-view').innerHTML =
      `<h2>Elos</h2><div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:24px;margin-top:24px">${tiers.map((tier) => `<div style="display:grid;justify-items:center">${rankBadge(tier.id, tier.divisions[0])}<span>${rankName(tier.id, tier.divisions[0])}</span></div>`).join('')}</div>`;
  });
  await page.screenshot({ path: `${folder}/ranking--elo-gallery.png` });
});

test('capture populated item details and later ranking pages', async ({ page }, testInfo) => {
  const folder = `test-results/walkthrough/${testInfo.project.name}`;
  for (const sample of [
    { tab: 'loja', item: 'loja-banner-vulcao' },
    { tab: 'passe', item: 'passe-8' },
    { tab: 'meu-time', sub: 'conquistas', item: 'clube-nivel-15' },
  ]) {
    await gotoScreen(page, sample);
    await page.locator(`[data-item="${sample.item}"]`).first().click();
    await settle(page);
    await page.screenshot({ path: `${folder}/${sample.tab}--item-sheet.png` });
  }
  await gotoScreen(page, { tab: 'ranking', sub: 'jogadores' });
  await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
  await page.screenshot({ path: `${folder}/ranking--jogadores--page-2.png` });
  await page.getByRole('button', { name: 'Última página', exact: true }).click();
  await page.screenshot({ path: `${folder}/ranking--jogadores--page-3.png` });
});

test('capture pass progression and shop rarity details', async ({ page }, testInfo) => {
  const folder = `test-results/walkthrough/${testInfo.project.name}`;
  await gotoScreen(page, { tab: 'passe' });
  await page.locator('.passe__track').scrollIntoViewIfNeeded();
  await settle(page);
  await page.screenshot({ path: `${folder}/passe--reward-track.png` });
  const track = page.locator('.passe__track');
  const nextPageLeft = await track.evaluate((el) =>
    Math.min(
      el.scrollLeft + el.clientWidth - el.querySelector('.passe__lane').offsetWidth,
      el.scrollWidth - el.clientWidth,
    ),
  );
  await page.getByRole('button', { name: 'Próximos níveis', exact: true }).click();
  await expect
    .poll(() => track.evaluate((el, expected) => Math.abs(el.scrollLeft - expected), nextPageLeft))
    .toBeLessThanOrEqual(1);
  await settle(page);
  await page.screenshot({ path: `${folder}/passe--reward-track-next.png` });
  await page.evaluate(() => window.scrollTo(0, 0));
  const showMissions = () =>
    page.locator('.rbg-view').evaluate((view) => {
      const heading = view.querySelector('#passe-missoes');
      view.scrollTop += heading.getBoundingClientRect().top - view.getBoundingClientRect().top - 8;
    });
  await showMissions();
  await page.screenshot({ path: `${folder}/passe--missions.png` });
  for (const label of ['Diárias', 'Semanais', 'Temporada']) {
    await page.getByRole('radio', { name: label }).locator('..').click();
    await showMissions();
    await settle(page);
    await page.screenshot({ path: `${folder}/passe--missions-${label.toLowerCase()}.png` });
  }
  for (const sample of [
    { tab: 'passe', item: 'passe-10', name: 'free' },
    { tab: 'passe', item: 'passe-15', name: 'epic' },
    { tab: 'passe', item: 'passe-48', name: 'unknown-rarity' },
    { tab: 'passe', item: 'passe-50', name: 'final' },
    { tab: 'loja', item: 'loja-escuta-aqui', name: 'legendary' },
    { tab: 'loja', item: 'loja-mvp-cinturao', name: 'epic' },
  ]) {
    await gotoScreen(page, sample);
    await page.locator(`[data-item="${sample.item}"]`).first().click();
    await settle(page);
    await page.screenshot({ path: `${folder}/${sample.tab}--item-sheet-${sample.name}.png` });
  }
  await gotoScreen(page, { tab: 'loja' });
  await page.locator('.loja__grid--daily').scrollIntoViewIfNeeded();
  await settle(page);
  await page.screenshot({ path: `${folder}/loja--daily-items.png` });
});

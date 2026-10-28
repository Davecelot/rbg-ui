import { expect, test } from '@playwright/test';
import { everyScreen, gotoScreen } from '../helpers/panel.js';
import { player } from '../../src/data/player.js';
import { club } from '../../src/data/club.js';
import { playerRanking, clubRanking } from '../../src/data/ranking.js';
import { pass } from '../../src/data/pass.js';
import { rcs } from '../../src/data/rcs.js';

test('every default screen has loaded local art and populated content', async ({ page }) => {
  const failures = [];
  const remote = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname) && url.protocol !== 'data:') remote.push(url.href);
  });
  for (const screen of everyScreen().filter((screen) => screen.state === 'default')) {
    await gotoScreen(page, screen);
    const view = page.locator('.rbg-view');
    await expect(view).not.toContainText(/\[(?:avatar|item|escudo|placar|prévia|.*não capturad)/i);
    await expect
      .poll(() => view.locator('img').evaluateAll((images) => images.filter((image) => !image.complete).length))
      .toBe(0);
    const broken = await view
      .locator('img')
      .evaluateAll((images) => images.filter((image) => !image.naturalWidth).map((image) => image.getAttribute('src')));
    failures.push(...broken.map((src) => `${screen.tab}/${screen.sub}: ${src}`));
    if (await view.locator('.rbg-art__missing').count()) failures.push(`${screen.tab}/${screen.sub}: fallback art`);
  }
  expect(failures).toEqual([]);
  expect(remote).toEqual([]);
});

test('fixtures keep identity, scoring, progress and ownership coherent', () => {
  expect(playerRanking.rows).toHaveLength(143);
  expect(new Set(playerRanking.rows.map((row) => row.name)).size).toBe(143);
  expect(playerRanking.rows.map((row) => row.position)).toEqual(Array.from({ length: 143 }, (_, index) => index + 1));
  const self = playerRanking.rows.find((row) => row.mine);
  expect(self).toMatchObject({
    name: player.name,
    headSrc: player.headSrc,
    position: player.rank.position,
    pdl: player.rank.pdl,
    ...player.record,
  });
  expect(clubRanking.rows.find((row) => row.mine)).toMatchObject({
    name: club.name,
    level: club.level,
    xp: club.totalXp,
  });
  expect(club.history.wins + club.history.draws + club.history.losses).toBe(club.history.matches);
  expect(pass.track.map((reward) => reward.level)).toEqual(Array.from({ length: 50 }, (_, index) => index + 1));
  expect(pass.track.filter((reward) => reward.claimed).every((reward) => reward.level <= pass.level)).toBe(true);
  for (const mission of [...pass.missions.flatMap((group) => group.items), ...club.missions.items, ...club.trophies]) {
    expect(mission.done).toBeGreaterThanOrEqual(0);
    expect(mission.done).toBeLessThanOrEqual(mission.goal);
    expect(mission.goal).toBeGreaterThan(0);
  }
  expect(rcs.standings).toHaveLength(5);
  expect(rcs.confrontations.done + rcs.confrontations.pending).toBe(rcs.confrontations.total);
  expect(rcs.standings.reduce((sum, team) => sum + team.played, 0)).toBe(rcs.matches.official.length * 2);
  const goals = rcs.matches.official.reduce((sum, match) => sum + match.score[0] + match.score[1], 0);
  expect(rcs.standings.reduce((sum, team) => sum + team.goalsFor, 0)).toBe(goals);
  expect(rcs.standings.reduce((sum, team) => sum + team.goalsAgainst, 0)).toBe(goals);
  expect(rcs.tops.rows.reduce((sum, row) => sum + row.goals, 0)).toBe(goals);
  expect(rcs.tops.rows.reduce((sum, row) => sum + row.mvps, 0)).toBe(rcs.matches.official.length);
  for (const team of rcs.standings) {
    expect(team.wins + team.draws + team.losses).toBe(team.played);
    expect(team.points).toBe(team.wins * 3 + team.draws);
  }
});

test('RCS has a ready preview and preserves the locked QA state', async ({ page }) => {
  await gotoScreen(page, { tab: 'rcs-week', sub: 'fila' });
  await expect(page.locator('.rcs__lineup li')).toHaveCount(4);
  await page.getByRole('button', { name: 'Entrar na fila RCS', exact: true }).click();
  await expect(page.locator('#rbg-status')).toHaveText('Entrar na fila RCS: ainda não está no protótipo.');
  await gotoScreen(page, { tab: 'rcs-week', sub: 'fila', state: 'locked' });
  await expect(page.locator('.rcs__gate')).toContainText('Seu clube precisa estar inscrito e aprovado');
  await expect(page.locator('[data-action=primary]')).toHaveAttribute('aria-disabled', 'true');
  await gotoScreen(page, { tab: 'rcs-week', sub: 'jogos', state: 'empty' });
  await expect(page.locator('.rcs__matches li')).toHaveCount(0);
  await expect(page.locator('.rcs__games').first()).toContainText('Nenhuma partida criada');
  await gotoScreen(page, { tab: 'rcs-week', sub: 'tops', state: 'pending' });
  await expect(page.locator('.rcs__pending')).toContainText('Aguardando divulgação');
});

test('club titles and presentations equip independently and empty inventory remains available', async ({ page }) => {
  await gotoScreen(page, { tab: 'meu-time', sub: 'personalizar' });
  await page.locator('.equip__tile', { hasText: 'Título Veteranos' }).click();
  await page.getByRole('button', { name: 'Equipar', exact: true }).click();
  await expect(page.locator('input[name="clube-titulo"][value="veteranos"]')).toBeChecked();
  await expect(page.locator('input[name="clube-titulo"][value="veteranos"]')).toBeFocused();
  await expect(page.locator('input[name="clube-apresentacao"][value="apresentacao"]')).toBeChecked();
  await gotoScreen(page, { tab: 'meu-time', sub: 'personalizar', state: 'empty' });
  await expect(page.locator('.clube__empty-title')).toContainText('ainda não tem itens');
});

test('item art loads in sheets and missing item art has a readable fallback', async ({ page }) => {
  await gotoScreen(page, { tab: 'loja' });
  await page.locator('[data-item="loja-banner-vulcao"]').click();
  await expect(page.locator('.rbg-sheet__art > .rbg-art').first()).toBeVisible();
  const overlap = await page.locator('.rbg-sheet').evaluate((sheet) => {
    const art = sheet.querySelector('.rbg-sheet__art > .rbg-art').getBoundingClientRect();
    const preview = sheet.querySelector('.rbg-sheet__preview').getBoundingClientRect();
    const caption = sheet.querySelector('figcaption').getBoundingClientRect();
    const buy = sheet.querySelector('.rbg-sheet__buyrow').getBoundingClientRect();
    return art.bottom > caption.top || preview.bottom > buy.top;
  });
  expect(overlap).toBe(false);
  expect(
    await page
      .locator('.rbg-sheet__art > .rbg-art')
      .first()
      .evaluate((image) => image.naturalWidth),
  ).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await page.route('**/assets/items/**', (route) => route.abort());
  await page.reload();
  await expect(page.locator('.loja__art .rbg-art__missing').first()).toContainText('Escuta Aqui');
});

test('boot colors match the saved preview and the blue reward uses blue art', async ({ page }) => {
  await gotoScreen(page, { tab: 'vestiario', sub: 'chuteira' });
  await expect(page.locator('.vestiario__boot-slot img')).toHaveAttribute('src', '/assets/items/chuteira-branco.png');
  await page.locator('.vestiario__color', { hasText: 'Azul' }).click();
  await page.getByRole('button', { name: 'Salvar cor', exact: true }).click();
  await expect(page.locator('.vestiario__boot-slot img')).toHaveAttribute('src', '/assets/items/chuteira-azul.png');
  await gotoScreen(page, { tab: 'passe' });
  await page.locator('.passe__track [data-item="passe-8"]').click();
  await expect(page.locator('.rbg-sheet__art > .rbg-art').first()).toHaveAttribute(
    'src',
    '/assets/items/moldura-1.png',
  );
});

test('club rewards wrap into complete tiles without a hidden horizontal rail', async ({ page }) => {
  await gotoScreen(page, { tab: 'meu-time', sub: 'conquistas' });
  const rails = await page.locator('.rbg-tiles').evaluateAll((lists) =>
    lists.map((list) => ({
      overflow: list.scrollWidth > list.clientWidth,
      clipped: [...list.children].some(
        (tile) => tile.getBoundingClientRect().right > list.getBoundingClientRect().right + 1,
      ),
    })),
  );
  expect(rails.every((rail) => !rail.overflow && !rail.clipped)).toBe(true);
  await page.locator('[data-item="clube-nivel-50"]').click();
  await expect(page.locator('.rbg-sheet__title')).toHaveText('Entrada Lendária');
});

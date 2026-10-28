import { expect, test } from '@playwright/test';
import { gotoScreen, position, settle } from '../helpers/panel.js';

const cta = '.rbg-actionbar [data-action=primary]';

test('the play-bar shortcut opens the unselected two-mode picker from any tab', async ({ page }) => {
  await gotoScreen(page, { tab: 'perfil' });
  await page.locator(cta).click();
  expect(await position(page)).toMatchObject({ tab: 'jogar', sub: 'modo' });
  await expect(page.locator('.jogar__mode')).toHaveCount(2);
  await expect(page.locator('.jogar__mode', { hasText: '0 jogadores buscando' })).toHaveCount(1);
  await expect(page.locator('.jogar__mode input:checked')).toHaveCount(0);
  await expect(page.locator(cta)).toHaveText('Jogar');
  await expect(page.locator(cta)).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('.rbg-actionbar__reason')).toHaveText('Escolha um modo para continuar.');
});

test('a deep link to the picker does not restore a previous mode choice', async ({ page }) => {
  await gotoScreen(page, { tab: 'jogar', sub: 'modo', mode: 'escolhido-solo' });
  await expect(page.locator('.jogar__mode')).toHaveCount(2);
  await expect(page.locator('.jogar__mode input:checked')).toHaveCount(0);
  await expect(page.locator(cta)).toHaveText('Jogar');
  await expect(page.locator(cta)).toHaveAttribute('aria-disabled', 'true');
});

test('picking a mode rewrites the play bar and Confirmar lands on it', async ({ page }) => {
  await gotoScreen(page, { tab: 'jogar', sub: 'modo' });
  await page.locator('.jogar__mode', { hasText: 'Amistosos' }).click();
  await expect(page.locator('.rbg-actionbar__title')).toHaveText('Amistosos');
  await expect(page.locator(cta)).toHaveText('Confirmar');
  await expect(page.locator('.jogar__mode input[value="amistosos"]')).toBeFocused();
  await page.locator(cta).click();
  expect(await position(page)).toMatchObject({ tab: 'jogar', sub: 'modo', mode: 'amistosos' });
});

test('a disabled play-bar CTA shows its reason and announces it when pressed', async ({ page }) => {
  await gotoScreen(page, { tab: 'jogar', sub: 'amistosos' });
  await expect(page.locator(cta)).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('.rbg-actionbar__reason')).toHaveText('Escalação com aceite obrigatório dos 8 jogadores.');
  await page.locator(cta).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#rbg-status')).toHaveText('Escalação com aceite obrigatório dos 8 jogadores.');
  expect((await position(page)).sub).toBe('modo');
});

test('back-to-picker controls start the content block at the top left', async ({ page }) => {
  for (const mode of ['buscando', 'amistosos']) {
    await gotoScreen(page, { tab: 'jogar', sub: 'modo', mode });
    const back = page.getByRole('button', { name: 'Trocar modo' });
    await expect(back).toBeVisible();
    const bounds = await back.boundingBox();
    const view = await page.locator('.rbg-view').boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(view.x);
    expect(bounds.x).toBeLessThan(view.x + view.width / 2);
    expect(bounds.y).toBeLessThan((await page.locator('.jogar__head, .jogar__queue').first().boundingBox()).y);
    await back.click();
    await expect(page.locator('.jogar__mode')).toHaveCount(2);
    await expect(page.getByRole('tab', { name: 'Jogar', exact: true })).toBeFocused();
  }
});

test('leaving Jogar clears the selection before the next shortcut visit', async ({ page }) => {
  await gotoScreen(page, { tab: 'jogar', sub: 'modo' });
  await page.locator('.jogar__mode', { hasText: 'Amistosos' }).click();
  await expect(page.locator(cta)).toHaveText('Confirmar');
  await page.getByRole('tab', { name: 'Ranking', exact: true }).click();
  await expect(page.locator(cta)).toHaveText('Jogar');
  await page.locator(cta).click();
  await expect(page.locator('.jogar__mode input:checked')).toHaveCount(0);
  await expect(page.locator(cta)).toHaveText('Jogar');
});

test('mode choices are one row with a readable selected state and keyboard selection', async ({ page }) => {
  await gotoScreen(page, { tab: 'jogar', sub: 'modo' });
  const choices = page.locator('.jogar__mode');
  await expect(choices).toHaveCount(2);
  await expect(page.locator('.jogar__mode input:checked')).toHaveCount(0);
  await settle(page);
  const boxes = await choices.evaluateAll((items) => items.map((item) => item.getBoundingClientRect().top));
  expect(new Set(boxes).size).toBe(1);
  await page.getByRole('radio', { name: /Ranqueada Solo/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('input[value="amistosos"]')).toBeChecked();
  await expect(page.locator('input[value="amistosos"]')).toBeFocused();
  const selected = page.locator('.jogar__mode', { has: page.locator('input:checked') });
  await expect(selected.locator('.jogar__mode-selected')).toBeVisible();
  await expect(selected).toHaveCSS('background-color', 'rgb(250, 250, 250)');
  await expect(page.locator(cta)).toHaveText('Confirmar');
  expect((await position(page)).sub).toBe('modo');
});

test('a searching-mode shortcut outside Jogar opens the unselected picker', async ({ page }) => {
  await gotoScreen(page, { tab: 'ranking', mode: 'buscando' });
  await page.getByRole('button', { name: 'Jogar', exact: true }).click();
  expect(await position(page)).toMatchObject({ tab: 'jogar', sub: 'modo' });
  await expect(page.locator('.jogar__mode input:checked')).toHaveCount(0);
  await expect(page.locator('.rbg-actionbar')).toHaveAttribute('data-queue', 'idle');
  await expect(page.locator('[data-queue-time]:visible')).toHaveCount(0);
});

test('confirming Solo opens positions without entering the queue', async ({ page }) => {
  await gotoScreen(page, { tab: 'jogar', sub: 'modo' });
  await page.locator('.jogar__mode', { hasText: 'Ranqueada Solo' }).click();
  await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Entrar na fila', exact: true })).toBeVisible();
  await expect(page.locator(cta)).toHaveText('Entrar na fila');
  await expect(page.locator('.rbg-view').getByRole('button', { name: 'Entrar na fila', exact: true })).toHaveCount(0);
  await expect(page.locator('.jogar__figure')).toHaveText('0/8');
  await expect(page.locator('.rbg-actionbar')).toHaveAttribute('data-queue', 'idle');
  expect(await position(page)).toMatchObject({ tab: 'jogar', sub: 'modo', mode: 'buscando' });
});

test('the shortcut opens an unselected picker and Solo starts from its detail view', async ({ page }) => {
  await gotoScreen(page, { tab: 'jogar', sub: 'ranqueada-solo' });
  await expect(page.locator(cta)).toHaveText('Entrar na fila');
  await page.getByRole('tab', { name: 'Ranking', exact: true }).click();
  await expect(page.locator(cta)).toHaveText('Jogar');
  await page.locator(cta).click();
  await expect(page.locator('.jogar__mode input:checked')).toHaveCount(0);
  await page.locator('.jogar__mode', { hasText: 'Ranqueada Solo' }).click();
  await expect(page.locator(cta)).toHaveText('Confirmar');
  await page.locator(cta).click();
  await expect(page.locator(cta)).toHaveText('Entrar na fila');
  await page.locator(cta).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator(cta)).toHaveText('Sair da fila');
  await expect(page.locator(cta)).toBeFocused();
  await expect(page.locator('.jogar__seats .is-filled')).toHaveText('Você');
});

test('queue fills your seat, times the search, locks preferences, cancels and restarts', async ({ page }) => {
  await page.clock.install();
  await gotoScreen(page, { tab: 'jogar', sub: 'ranqueada-solo' });
  await page.getByRole('group', { name: 'Posição primária' }).locator('label', { hasText: /^MID$/ }).click();
  await page.getByRole('group', { name: 'Posição secundária' }).locator('label', { hasText: /^DEF$/ }).click();
  await page.getByRole('button', { name: 'Entrar na fila', exact: true }).click();
  await expect(page.locator('.jogar__seats .is-filled')).toHaveCount(1);
  await expect(page.locator('.jogar__seats .is-filled')).toHaveText('Você');
  await expect(page.locator('.jogar__seats li')).toHaveCount(8);
  await expect(page.locator('.jogar__figure')).toHaveText('0:00');
  await expect(page.locator('input[name="primaria"][value="MID"]')).toBeDisabled();
  await expect(page.locator('input[name="secundaria"][value="DEF"]')).toBeDisabled();
  await expect(page.locator('[data-queue-positions]')).toContainText('MID');
  await expect(page.locator('[data-queue-positions]')).toContainText('DEF');
  await page.clock.fastForward(65000);
  await expect(page.locator('.jogar__figure')).toHaveText('1:05');
  await expect(page.locator('.rbg-actionbar [data-queue-time]')).toHaveText('1:05');
  await expect(page.locator('#rbg-status')).toHaveText('Você entrou na fila. Procurando partida.');
  await page.getByRole('button', { name: 'Sair da fila', exact: true }).click();
  await expect(page.locator('.jogar__figure')).toHaveText('0/8');
  await expect(page.locator('.jogar__seats .is-filled')).toHaveCount(0);
  await expect(page.locator('input[name="primaria"][value="MID"]')).toBeChecked();
  await expect(page.locator('input[name="secundaria"][value="DEF"]')).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Entrar na fila', exact: true })).toBeFocused();
  await page.clock.fastForward(10000);
  await expect(page.locator('.jogar__figure')).toHaveText('0/8');
  await page.getByRole('button', { name: 'Entrar na fila', exact: true }).click();
  await expect(page.locator('.jogar__figure')).toHaveText('0:00');
});

test('queue survives tabs and closing the panel; mode changes are locked and cancellation works elsewhere', async ({
  page,
}) => {
  await page.clock.install();
  await gotoScreen(page, { tab: 'jogar', sub: 'ranqueada-solo' });
  await page.getByRole('button', { name: 'Entrar na fila', exact: true }).click();
  await page.getByRole('tab', { name: 'Ranking', exact: true }).click();
  await page.clock.fastForward(12000);
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.clock.fastForward(8000);
  await page.locator('[data-host-launcher]').click();
  await expect(page.locator('.rbg-actionbar [data-queue-time]')).toHaveText('0:20');
  await page.getByRole('tab', { name: 'Jogar', exact: true }).click();
  await expect(page.locator('.jogar__mode input:disabled')).toHaveCount(0);
  await expect(page.locator('.jogar__mode')).toHaveCount(0);
  await expect(page.locator('.jogar__figure')).toHaveText('0:20');
  await page.getByRole('tab', { name: 'Perfil', exact: true }).first().click();
  await page.getByRole('button', { name: 'Sair da fila', exact: true }).click();
  await expect(page.locator('.rbg-actionbar')).toHaveAttribute('data-queue', 'idle');
  await expect(page.locator(cta)).toHaveText('Jogar');
  await expect(page.locator('#rbg-status')).toHaveText('Você saiu da fila.');
});

test('match-found demo deep link exposes the static countdown and focuses the line-up', async ({ page }) => {
  await gotoScreen(page, { tab: 'jogar', state: 'escalacao' });
  expect(await position(page)).toMatchObject({ tab: 'jogar', sub: 'modo', state: 'escalacao', mode: 'escalacao' });
  await expect(page.getByRole('heading', { name: 'Escalação', exact: true })).toBeVisible();
  await expect(page.locator('.jogar__countdown time')).toHaveText('6s');
  await expect(page.locator('.jogar__player')).toHaveCount(8);
  await expect(page.locator(cta)).toHaveText('Ver escalação');
  await page.locator(cta).click();
  await expect(page.locator('#jogar-escalacao')).toBeFocused();
  const actionbarTop = await page.locator('.rbg-actionbar').evaluate((bar) => bar.getBoundingClientRect().top);
  for (const squad of await page.locator('.jogar__squad').all()) {
    await expect(squad.locator('.jogar__player').first()).toBeInViewport();
    const lastPlayer = await squad.locator('.jogar__player').last().boundingBox();
    expect(lastPlayer.y + lastPlayer.height).toBeLessThanOrEqual(actionbarTop);
  }
  const viewWidth = await page.locator('.rbg').evaluate((panel) => panel.clientWidth);
  if (viewWidth < 1100) {
    const autofillPlayer = page.locator('.jogar__autofill').locator('..');
    const playerName = await autofillPlayer.locator('strong').boundingBox();
    const autofill = await page.locator('.jogar__autofill').boundingBox();
    expect(playerName.x + playerName.width).toBeLessThanOrEqual(autofill.x);
  }
  await expect(page.locator('#rbg-status')).toHaveText('Escalação da partida.');
  if (process.env.WALKTHROUGH) {
    await page.screenshot({
      path: `test-results/walkthrough/${test.info().project.name}/jogar--modo--escalacao-roster.png`,
    });
  }
});

test('redirect demo deep link announces the unavailable host handoff', async ({ page }) => {
  await gotoScreen(page, { tab: 'jogar', state: 'em-andamento' });
  expect(await position(page)).toMatchObject({
    tab: 'jogar',
    sub: 'modo',
    state: 'em-andamento',
    mode: 'em-andamento',
  });
  await expect(page.getByRole('heading', { name: 'Partida em andamento' })).toBeVisible();
  await expect(page.locator('.jogar__countdown')).toHaveCount(0);
  await expect(page.locator('.jogar__player')).toHaveCount(8);
  await expect(page.locator(cta)).toHaveText('Ver partida');
  await page.locator(cta).click();
  await expect(page.locator('#rbg-status')).toHaveText(
    'Você está sendo levado ao campo. A integração com a partida ainda não está no protótipo.',
  );
});

test('reload and deep links never restore an active queue', async ({ page }) => {
  await gotoScreen(page, { tab: 'jogar', sub: 'ranqueada-solo', mode: 'buscando' });
  await expect(page.locator('.jogar__figure')).toHaveText('0/8');
  await page.getByRole('button', { name: 'Entrar na fila', exact: true }).click();
  await page.reload();
  await expect(page.locator('.jogar__figure')).toHaveText('0/8');
  await expect(page.getByRole('button', { name: 'Entrar na fila', exact: true })).toBeVisible();
});

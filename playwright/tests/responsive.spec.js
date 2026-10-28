import { expect, test } from '@playwright/test';
import { everyScreen, gotoScreen, layoutProblems } from '../helpers/panel.js';

test('every screen state fits the panel at this host size', async ({ page }) => {
  const failures = [];
  for (const mode of ['buscando', 'amistosos']) {
    await gotoScreen(page, { tab: 'jogar', sub: 'modo', mode });
    for (const problem of await layoutProblems(page)) failures.push(`jogar--${mode}: ${problem}`);
  }
  for (const screen of everyScreen()) {
    await gotoScreen(page, screen);
    for (const problem of await layoutProblems(page))
      failures.push(`${screen.tab}--${screen.sub}--${screen.state}: ${problem}`);
  }
  expect(failures).toEqual([]);
});

test('active search fits in Solo, the locked picker, and the global bar on every tab', async ({ page }) => {
  await gotoScreen(page, { tab: 'jogar', sub: 'ranqueada-solo' });
  await page.getByRole('button', { name: 'Entrar na fila', exact: true }).click();
  expect(await layoutProblems(page)).toEqual([]);
  const failures = [];
  for (const tab of ['perfil', 'vestiario', 'meu-time', 'jogar', 'ranking', 'rcs-week', 'passe', 'loja']) {
    await page.locator(`[data-tab="${tab}"][role="tab"]`).click();
    for (const problem of await layoutProblems(page)) failures.push(`${tab}: ${problem}`);
  }
  expect(failures).toEqual([]);
});

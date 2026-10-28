import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { everyScreen, gotoScreen } from '../helpers/panel.js';

const SELF_CHECK = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../.agents/skills/a11y-checker/scripts/a11y-self-check.js',
);

test('no HIGH-impact a11y self-check failures on any screen state', async ({ page }) => {
  await page.addInitScript(() => (window.A11Y_SELF_CHECK_HEADLESS = true));
  const failures = [];
  for (const screen of everyScreen()) {
    await gotoScreen(page, screen);
    await page.addScriptTag({ path: SELF_CHECK });
    const results = await page.evaluate(async () => (await window.A11ySelfCheck.run({ reflow: false })).results);
    for (const result of results.filter((item) => item.status === 'fail' && item.impact === 'HIGH')) {
      failures.push(
        `${screen.tab}--${screen.sub}--${screen.state}: [SC ${result.sc}] ${result.check} — ${result.detail}`,
      );
    }
  }
  expect(failures).toEqual([]);
});

test('active queue and unselected picker have no HIGH-impact a11y failures', async ({ page }) => {
  await page.addInitScript(() => (window.A11Y_SELF_CHECK_HEADLESS = true));
  await gotoScreen(page, { tab: 'jogar', sub: 'ranqueada-solo' });
  await page.getByRole('button', { name: 'Entrar na fila', exact: true }).click();
  await page.addScriptTag({ path: SELF_CHECK });
  const queueResults = await page.evaluate(async () => (await window.A11ySelfCheck.run({ reflow: false })).results);
  expect(queueResults.filter((item) => item.status === 'fail' && item.impact === 'HIGH')).toEqual([]);
  await page.getByRole('button', { name: 'Sair da fila', exact: true }).click();
  await page.locator('.rbg-actionbar [data-action=primary]').click();
  const pickerResults = await page.evaluate(async () => (await window.A11ySelfCheck.run({ reflow: false })).results);
  expect(pickerResults.filter((item) => item.status === 'fail' && item.impact === 'HIGH')).toEqual([]);
});

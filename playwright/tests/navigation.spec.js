import { expect, test } from '@playwright/test';
import { gotoScreen, modes, position, tabs } from '../helpers/panel.js';

test('deep links restore the screen and normalize non-Jogar mode choices to the shortcut', async ({ page }) => {
  await gotoScreen(page, { tab: 'ranking', sub: 'times', state: 'default', mode: 'amistosos' });
  expect(await position(page)).toEqual({ tab: 'ranking', sub: 'times', state: 'default', mode: 'escolher' });
  await expect(page.locator('.rbg-actionbar [data-action=primary]')).toHaveText('Jogar');
});

test('unknown deep-link values fall back to the first tab, sub, state and mode', async ({ page }) => {
  await gotoScreen(page, { tab: 'nope', sub: 'nope', state: 'nope', mode: 'nope' });
  expect(await position(page)).toEqual({
    tab: tabs[0].id,
    sub: tabs[0].subs[0].id,
    state: tabs[0].subs[0].states[0],
    mode: modes[0].id,
  });
});

test('arrow keys, Home and End move between tabs and announce them', async ({ page }) => {
  await gotoScreen(page);
  await page.locator(`.rbg-tabs [data-tab="${tabs[0].id}"]`).focus();
  await page.keyboard.press('ArrowRight');
  expect((await position(page)).tab).toBe(tabs[1].id);
  await expect(page.locator(`.rbg-tabs [data-tab="${tabs[1].id}"]`)).toBeFocused();
  await expect(page.locator('#rbg-status')).toContainText(tabs[1].label);
  await page.keyboard.press('End');
  expect((await position(page)).tab).toBe(tabs.at(-1).id);
  await page.keyboard.press('ArrowRight');
  expect((await position(page)).tab).toBe(tabs[0].id);
  await page.keyboard.press('ArrowLeft');
  expect((await position(page)).tab).toBe(tabs.at(-1).id);
  await page.keyboard.press('Home');
  expect((await position(page)).tab).toBe(tabs[0].id);
});

test('only one tab per tablist is in the tab order', async ({ page }) => {
  await gotoScreen(page);
  await expect(page.locator('.rbg-tabs [role=tab][tabindex="0"]')).toHaveCount(1);
  await expect(page.locator('.rbg-subtabs [role=tab][tabindex="0"]')).toHaveCount(1);
});

test('sub-tabs switch the view and keep the tab', async ({ page }) => {
  const tab = tabs.find((item) => item.subs.length > 1);
  await gotoScreen(page, { tab: tab.id });
  await page.locator(`.rbg-subtabs [data-sub="${tab.subs[1].id}"]`).click();
  expect(await position(page)).toMatchObject({ tab: tab.id, sub: tab.subs[1].id });
  await expect(page.locator('#rbg-status')).toContainText(tab.subs[1].label);
});

test('Vestiário keeps detail navigation out of the second-level tab strip', async ({ page }) => {
  await gotoScreen(page, { tab: 'vestiario' });
  await expect(page.locator('.rbg-subtabs')).toBeHidden();
  await page.locator('#vestiario-slot-numero').click();
  await expect(page.locator('.rbg-view')).toHaveAttribute('data-sub', 'numero');
  await expect(page.locator('#rbg-status')).toHaveText('Vestiário — Número');
  await expect(page.locator('.rbg-subtabs')).toBeHidden();
});

test('Esc closes the panel, returns focus to the launcher, and reopening focuses the active tab', async ({ page }) => {
  await gotoScreen(page, { tab: 'loja' });
  await page.locator('.rbg-tabs [data-tab="loja"]').focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('#rbg')).toBeHidden();
  await expect(page.locator('[data-host-launcher]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#rbg')).toBeVisible();
  await expect(page.locator('.rbg-tabs [data-tab="loja"]')).toBeFocused();
});

test('settings switches the window resolution, persists it, and Esc closes settings before the panel', async ({
  page,
}) => {
  await gotoScreen(page, { size: '1280' });
  await page.locator('[data-action=settings]').click();
  await expect(page.locator('#rbg-settings')).toBeVisible();
  await page.getByLabel('1024 × 576').check();
  await expect(page.locator('#rbg')).toHaveAttribute('data-size', '1024');
  await expect.poll(async () => (await page.locator('.rbg-panel').boundingBox()).width).toBeLessThanOrEqual(1025);
  await page.keyboard.press('Escape');
  await expect(page.locator('#rbg-settings')).toBeHidden();
  await expect(page.locator('#rbg')).toBeVisible();
  await expect(page.locator('[data-action=settings]')).toBeFocused();
  await page.goto('/');
  await expect(page.locator('#rbg')).toHaveAttribute('data-size', '1024');
});

test('in-view links switch tab, announce it and move focus to that tab', async ({ page }) => {
  await gotoScreen(page, { tab: 'perfil' });
  await page.locator('.rbg-view [data-go="ranking"]').click();
  expect((await position(page)).tab).toBe('ranking');
  await expect(page.locator('.rbg-tabs [data-tab="ranking"]')).toBeFocused();
  await expect(page.locator('#rbg-status')).toContainText('Ranking');
});

import { expect, test } from '@playwright/test';
import { tabs, gotoScreen, settle } from '../helpers/panel.js';

const recordReveals = async (page) => {
  await page.addInitScript(() => {
    window.reveals = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      const animation = animate.call(this, keyframes, options);
      const box = this.getBoundingClientRect();
      window.reveals.push({ element: this, animation, keyframes, options, top: box.top, left: box.left });
      return animation;
    };
  });
};

const revealCount = (page) => page.evaluate(() => window.reveals.length);

test('main tab changes enter in bounded visual order without animating chrome or nesting effects', async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  await recordReveals(page);
  await gotoScreen(page, { tab: 'perfil' });
  for (const tab of tabs) {
    const screen = { tab: tab.id };
    if (tab.id !== 'perfil') await page.locator(`[data-tab="${tab.id}"]`).click();
    await settle(page);
    const result = await page.evaluate(() => {
      const records = window.reveals.filter(({ element }) => element.isConnected);
      const view = document.querySelector('.rbg-view');
      const bounds = view.getBoundingClientRect();
      const uncovered = [];
      const walker = document.createTreeWalker(view, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (
          !node.textContent.trim() ||
          node.parentElement.closest('[hidden], .rbg-visually-hidden') ||
          document.activeElement.contains(node)
        )
          continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const box = range.getBoundingClientRect();
        if (
          box.width &&
          box.height &&
          box.bottom > bounds.top &&
          box.top < bounds.bottom &&
          box.right > bounds.left &&
          box.left < bounds.right &&
          !records.some(({ element }) => element.contains(node))
        )
          uncovered.push(node.textContent.trim());
      }
      return {
        uncovered,
        count: records.length,
        outside: records.some(({ element }) => !element.closest('.rbg-view')),
        nested: records.some(({ element }) =>
          records.some((other) => other.element !== element && other.element.contains(element)),
        ),
        timings: records.map(({ options }) => options.duration + options.delay),
        rows: records.map(({ top, left, options }) => ({ top, left, delay: options.delay })),
        finished: records.every(({ animation }) => animation.playState === 'finished'),
      };
    });
    expect(result.outside, JSON.stringify(screen)).toBe(false);
    expect(result.nested, JSON.stringify(screen)).toBe(false);
    if (testInfo.project.name === 'reduced-motion') {
      expect(result.count, JSON.stringify(screen)).toBe(0);
      continue;
    }
    expect(result.count, JSON.stringify(screen)).toBeGreaterThan(0);
    expect(result.uncovered, JSON.stringify(screen)).toEqual([]);
    expect(result.finished, JSON.stringify(screen)).toBe(true);
    expect(Math.max(...result.timings)).toBeLessThanOrEqual(360);
    let rowTop = Math.min(...result.rows.map(({ top }) => top));
    for (let i = 1; i < result.rows.length; i++) {
      expect(result.rows[i].delay).toBeGreaterThanOrEqual(result.rows[i - 1].delay);
      if (result.rows[i].top <= rowTop + 8) {
        expect(result.rows[i].left).toBeGreaterThanOrEqual(result.rows[i - 1].left);
      } else {
        expect(result.rows[i].top).toBeGreaterThan(rowTop + 8);
        rowTop = Math.min(...result.rows.slice(i).map(({ top }) => top));
      }
    }
  }
});

test('mission filters and text updates do not replay entrances', async ({ page }) => {
  await recordReveals(page);
  await gotoScreen(page, { tab: 'passe' });
  await page.getByRole('radio', { name: 'Semanais', exact: true }).scrollIntoViewIfNeeded();
  await settle(page);
  const before = await revealCount(page);
  await page.getByRole('radio', { name: 'Semanais', exact: true }).locator('..').click();
  await settle(page);
  expect(await revealCount(page)).toBe(before);
  const after = await revealCount(page);
  await page
    .locator('.passe__missions:not([hidden]) .passe__mission-name')
    .first()
    .evaluate((el) => {
      el.textContent = 'Missão atualizada';
    });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await revealCount(page)).toBe(after);
});

test('fast navigation cancels discarded reveals and focus remains immediate', async ({ page }) => {
  await recordReveals(page);
  await gotoScreen(page, { tab: 'perfil' });
  await page.evaluate(async () => {
    document.querySelector('[data-tab="loja"]').click();
    await new Promise(requestAnimationFrame);
    document.querySelector('[data-tab="meu-time"]').click();
    await new Promise(requestAnimationFrame);
    document.querySelector('[data-tab="ranking"]').click();
  });
  await settle(page);
  const oldStates = await page.evaluate(() =>
    window.reveals.filter(({ element }) => !element.isConnected).map(({ animation }) => animation.playState),
  );
  expect(oldStates.every((state) => state === 'idle' || state === 'finished')).toBe(true);
  await page.getByRole('tab', { name: 'Jogadores', exact: true }).focus();
  const beforeSubtab = await revealCount(page);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Times', exact: true })).toBeFocused();
  await settle(page);
  expect(await revealCount(page)).toBe(beforeSubtab);
  await page.keyboard.press('Escape');
  await expect(page.locator('.rbg-panel')).not.toBeVisible();
  await expect(page.locator('[data-host-launcher]')).toBeFocused();
});

test('system reduced motion cancels an entrance immediately and allows later entrances when restored', async ({
  page,
}) => {
  await recordReveals(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await gotoScreen(page, { tab: 'loja' });
  await page.evaluate(() => {
    for (const { animation } of window.reveals) animation.pause();
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() => page.evaluate(() => window.reveals.every(({ animation }) => animation.playState === 'idle')))
    .toBe(true);
  const before = await revealCount(page);
  await page.getByRole('tab', { name: 'Meu Time', exact: true }).click();
  await settle(page);
  expect(await revealCount(page)).toBe(before);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('tab', { name: 'Loja', exact: false }).click();
  await expect.poll(() => revealCount(page)).toBeGreaterThan(before);
});

test('Jogar selection preserves the picker and focus without replaying entrances', async ({ page }) => {
  await recordReveals(page);
  await gotoScreen(page, { tab: 'jogar' });
  await settle(page);
  await page.locator('.jogar__modes').evaluate((element) => (window.originalPicker = element));
  const before = await revealCount(page);
  const solo = page.getByRole('radio', { name: /Ranqueada Solo/ });
  await solo.locator('..').click();
  await expect(solo).toBeChecked();
  await expect(solo).toBeFocused();
  await expect(page.locator('.rbg-actionbar [data-action=primary]')).toHaveText('Confirmar');
  await expect(page).toHaveURL(/mode=escolhido-solo/);
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: /Amistosos/ })).toBeChecked();
  await expect(page.getByRole('radio', { name: /Amistosos/ })).toBeFocused();
  await expect(page).toHaveURL(/mode=escolhido-amistosos/);
  await settle(page);
  expect(await page.evaluate(() => window.originalPicker === document.querySelector('.jogar__modes'))).toBe(true);
  expect(await revealCount(page)).toBe(before);
});

import { expect } from '@playwright/test';
import { modes } from '../../src/data/modes.js';
import { sizes } from '../../src/data/sizes.js';
import { tabs } from '../../src/screens/index.js';

export { modes, sizes, tabs };

export function everyScreen() {
  return tabs.flatMap((tab) =>
    tab.subs.flatMap((sub) => sub.states.map((state) => ({ tab: tab.id, sub: sub.id, state }))),
  );
}

export async function gotoScreen(page, { tab, sub, state, mode, size } = {}) {
  const vestiarioDetail = tab === 'vestiario' && sub && sub !== 'vestiario-overview';
  const query = new URLSearchParams(
    Object.entries({ tab, sub: vestiarioDetail ? undefined : sub, state, mode, size }).filter(([, value]) => value),
  );
  await page.goto(`/?${query}`);
  await expect(page.locator('.rbg-view')).toBeVisible();
  if (vestiarioDetail) await page.locator(`.vestiario__slot[data-go-sub="${sub}"]`).click();
  await page.evaluate(() => document.fonts.ready);
}

export async function position(page) {
  const view = await page.locator('.rbg-view').evaluate((el) => ({ ...el.dataset }));
  const mode = await page.locator('.rbg-actionbar').getAttribute('data-mode');
  return { tab: view.tab, sub: view.sub, state: view.state, mode };
}

// Panel-level horizontal scroll, the view running under the action bar, and shell targets below 44×44.
export async function layoutProblems(page) {
  return page.locator('.rbg-panel').evaluate((panel) => {
    const problems = [];
    if (panel.scrollWidth > panel.clientWidth + 1) problems.push(`panel scrolls horizontally (${panel.scrollWidth}px)`);
    const view = panel.querySelector('.rbg-view');
    if (view.scrollWidth > view.clientWidth + 1) problems.push(`view scrolls horizontally (${view.scrollWidth}px)`);
    const bar = panel.querySelector('.rbg-actionbar').getBoundingClientRect();
    const viewBox = view.getBoundingClientRect();
    if (viewBox.bottom > bar.top + 1) problems.push('view extends under the action bar');
    for (const target of panel.querySelectorAll('[role=tab], [data-action]')) {
      const box = target.getBoundingClientRect();
      if (box.width && (box.width < 44 || box.height < 44)) {
        problems.push(
          `target ${target.dataset.tab ?? target.dataset.sub ?? target.dataset.action} is ${Math.round(box.width)}×${Math.round(box.height)}`,
        );
      }
    }
    return problems;
  });
}

// Newly mounted tabs can finish their transition before local artwork decodes.
export async function settle(page) {
  await page
    .locator('.rbg-panel img')
    .evaluateAll((images) => Promise.all(images.map((image) => image.decode().catch(() => {}))));
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    ),
  );
}

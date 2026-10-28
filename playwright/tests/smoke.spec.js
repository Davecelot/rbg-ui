import { expect, test } from '@playwright/test';
import { gotoScreen } from '../helpers/panel.js';

test('loads without console errors; the panel is 16:9, fits the window and never exceeds its preset', async ({
  page,
}) => {
  const errors = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));
  await gotoScreen(page);
  const viewport = page.viewportSize();
  const box = await page.locator('.rbg-panel').boundingBox();
  expect(box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.height).toBeLessThanOrEqual(viewport.height);
  expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
  const preset = await page.locator('#rbg').getAttribute('data-size');
  expect(box.width).toBeLessThanOrEqual(Number(preset) + 1);
  await expect(page.locator('.rbg-actionbar [data-action=primary]')).toBeVisible();
  expect(errors).toEqual([]);
});

test('loads nothing from another host', async ({ page }) => {
  const remote = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname) && url.protocol !== 'data:') remote.push(request.url());
  });
  await gotoScreen(page);
  expect(remote).toEqual([]);
});

test('pass, shop and shared item metadata leave matching host classes untouched', async ({ page }) => {
  await gotoScreen(page, { tab: 'passe' });
  const styles = await page.evaluate(() => {
    const host = document.createElement('section');
    host.style.cssText = 'position:fixed;left:-2000px;width:900px;height:400px;container:rbg / size';
    const rootStyle = getComputedStyle(document.querySelector('#rbg'));
    for (const property of rootStyle) {
      if (property.startsWith('--')) host.style.setProperty(property, rootStyle.getPropertyValue(property));
    }
    host.innerHTML = `
      <div data-class="passe__hero"><div data-class="passe__final">Final</div></div>
      <div data-class="passe__next"><strong>Próxima</strong></div>
      <div data-class="passe__note">Nível</div>
      <div data-class="passe__track">Trilha</div>
      <div data-class="loja__grid loja__grid--featured">
        <div data-class="loja__item"><div data-class="loja__art">Arte</div></div>
      </div>
      <div data-class="loja__meta">Raridade</div>
      <div data-class="rbg-tile__name">Nome</div>
      <div data-class="rbg-tile__meta">Categoria</div>
      <div data-class="rbg-sheet__meta">Detalhes</div>`;
    document.body.append(host);
    const properties = [
      'display',
      'grid-template-columns',
      'gap',
      'overflow-x',
      'color',
      'background-color',
      'padding',
      'font-size',
      'font-weight',
      'width',
      'min-width',
      'overflow-wrap',
      'text-align',
    ];
    const snapshot = () =>
      [...host.querySelectorAll('*')].map((el) => {
        const style = getComputedStyle(el);
        return Object.fromEntries(properties.map((property) => [property, style.getPropertyValue(property)]));
      });
    const before = snapshot();
    for (const el of host.querySelectorAll('[data-class]')) el.className = el.dataset.class;
    const after = snapshot();
    host.remove();
    return { before, after };
  });
  expect(styles.after).toEqual(styles.before);
});

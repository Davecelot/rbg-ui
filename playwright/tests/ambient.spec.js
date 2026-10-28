import { expect, test } from '@playwright/test';
import { gotoScreen } from '../helpers/panel.js';

const drift = (page) =>
  page.evaluate(() => {
    const waves = document.getAnimations().filter((animation) => animation.animationName === 'rbg-ambient-drift');
    if (!waves.length) return 'none';
    return waves.length === 2 && waves.every((wave) => wave.playState === waves[0].playState)
      ? waves[0].playState
      : 'mixed';
  });

test('background pauses from the keyboard, survives navigation and persists without changing resolution', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await gotoScreen(page, { size: '1280' });
  await expect.poll(() => drift(page)).toBe('running');
  await page.getByRole('button', { name: 'Configurações', exact: true }).click();
  const checkbox = page.getByRole('checkbox', { name: 'Animar fundo' });
  await expect(checkbox).toBeChecked();
  await page.keyboard.press('Tab');
  await expect(checkbox).toBeFocused();
  await page.keyboard.press('Space');
  await expect.poll(() => drift(page)).toBe('paused');
  await expect(page.locator('#rbg')).toHaveAttribute('data-size', '1280');
  const pausedTime = await page.evaluate(async () => {
    const animation = document.getAnimations().find((animation) => animation.animationName === 'rbg-ambient-drift');
    await animation.ready;
    return animation.currentTime;
  });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Configurações', exact: true })).toBeFocused();
  await page.getByRole('tab', { name: 'Ranking', exact: true }).click();
  expect(
    await page.evaluate(
      () => document.getAnimations().find((animation) => animation.animationName === 'rbg-ambient-drift').currentTime,
    ),
  ).toBe(pausedTime);
  await page.reload();
  await expect.poll(() => drift(page)).toBe('paused');
  await page.getByRole('button', { name: 'Configurações', exact: true }).click();
  await expect(checkbox).not.toBeChecked();
  await checkbox.check();
  await expect.poll(() => drift(page)).toBe('running');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await expect(page.locator('#rbg')).toBeHidden();
  await expect.poll(() => drift(page)).toBe('none');
  await page.keyboard.press('Enter');
  await expect.poll(() => drift(page)).toBe('running');
});

test('system reduced motion overrides animation and restores the stored choice live', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoScreen(page);
  await page.getByRole('button', { name: 'Configurações', exact: true }).click();
  const checkbox = page.getByRole('checkbox', { name: 'Animar fundo' });
  await expect(checkbox).toBeDisabled();
  await expect(checkbox).not.toBeChecked();
  await expect(page.locator('#rbg-motion-note')).toBeVisible();
  await expect.poll(() => drift(page)).toBe('none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(checkbox).toBeEnabled();
  await expect(checkbox).toBeChecked();
  await expect.poll(() => drift(page)).toBe('running');
  await checkbox.uncheck();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => drift(page)).toBe('none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(checkbox).not.toBeChecked();
  await expect.poll(() => drift(page)).toBe('paused');
});

test('unavailable host storage keeps the animation choice for this session', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    for (const method of ['getItem', 'setItem']) {
      Storage.prototype[method] = () => {
        throw new DOMException('Storage unavailable', 'SecurityError');
      };
    }
  });
  await gotoScreen(page);
  await page.getByRole('button', { name: 'Configurações', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Animar fundo' }).uncheck();
  await page.getByLabel('1024 × 576').check();
  await expect(page.locator('#rbg')).toHaveAttribute('data-size', '1024');
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Ranking', exact: true }).click();
  await expect.poll(() => drift(page)).toBe('paused');
  await page.getByRole('button', { name: 'Configurações', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Animar fundo' })).not.toBeChecked();
});

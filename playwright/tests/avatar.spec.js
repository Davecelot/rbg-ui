import { expect, test } from '@playwright/test';
import { gotoScreen } from '../helpers/panel.js';

test('avatar rotates by buttons and dragging either the sprite or Girar, with 360-degree wrapping', async ({
  page,
}) => {
  await gotoScreen(page, { tab: 'perfil' });
  const angle = page.locator('output[data-angle]');
  await page.getByRole('button', { name: 'Girar avatar para a direita' }).focus();
  await page.keyboard.press('Enter');
  await expect(angle).toHaveText('45°');
  await page.getByRole('button', { name: 'Girar avatar para a esquerda' }).click();
  await expect(angle).toHaveText('0°');
  const stage = await page.locator('.rbg-stage').boundingBox();
  for (const selector of ['.rbg-stage__sprite', '[data-turn]']) {
    const target = await page.locator(selector).boundingBox();
    const x = target.x + target.width / 2;
    const y = target.y + target.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + stage.width * 1.25, y, { steps: 8 });
    await page.mouse.up();
  }
  await expect(angle).toHaveText('180°');
  await expect(page.locator('.rbg-stage__sprite img')).toHaveAttribute('src', '/assets/avatars/player-0-back.png');
  await expect(page.locator('.rbg-stage__sprite')).toHaveCSS('touch-action', 'pan-y');
  await page.getByRole('tab', { name: 'Vestiário', exact: true }).click();
  await expect(angle).toHaveText('0°');
  await page.getByRole('button', { name: 'Girar avatar para a esquerda' }).click();
  await expect(angle).toHaveText('315°');
});

test('directional artwork uses the nearest frame and handles a missing file', async ({ page }) => {
  await page.route('**/assets/avatars/test-*.svg', (route) =>
    route.request().url().includes('missing')
      ? route.abort()
      : route.fulfill({
          contentType: 'image/svg+xml',
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="110"><rect width="64" height="110" fill="white"/></svg>',
        }),
  );
  await page.route('**/src/data/player.js*', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /avatarFrames: \[[\s\S]*?\],/,
      `avatarFrames: ${JSON.stringify([
        { angle: 0, src: '/assets/avatars/test-front.svg' },
        { angle: 180, src: '/assets/avatars/test-back.svg' },
        { angle: 270, src: '/assets/avatars/test-missing.svg' },
      ])},`,
    );
    await route.fulfill({ response, body });
  });
  await gotoScreen(page, { tab: 'perfil' });
  await page.getByRole('tab', { name: 'Vestiário', exact: true }).click();
  const sprite = page.locator('.rbg-stage__sprite img');
  await expect(sprite).toHaveAttribute('src', '/assets/avatars/test-front.svg');
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Girar avatar para a direita' }).click();
  await expect(sprite).toHaveAttribute('src', '/assets/avatars/test-back.svg');
  await expect(sprite).toHaveCSS('transform', 'none');
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Girar avatar para a direita' }).click();
  await expect(page.locator('.rbg-stage__sprite')).toHaveText('[avatar indisponível]');
});

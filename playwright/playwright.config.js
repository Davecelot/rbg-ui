import { defineConfig, devices } from '@playwright/test';

const PORT = 5173;
// Each project picks a `Resolução da janela` preset through the same storage key the panel uses.
const host = (name, width, height, size, extra = {}) => ({
  name,
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width, height },
    storageState: {
      cookies: [],
      origins: [{ origin: `http://localhost:${PORT}`, localStorage: [{ name: 'rbg:size', value: size }] }],
    },
    ...extra,
  },
});

export default defineConfig({
  testDir: './tests',
  outputDir: '../test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../playwright-report' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    host('size-1024', 1280, 800, '1024'),
    host('size-1280', 1440, 900, '1280'),
    host('size-1600', 1920, 1080, '1600'),
    // The 1600 preset in a 1024×640 window reflows to the smallest supported panel (≈992×558) — see DECISIONS.
    host('shrunk', 1024, 640, '1600'),
    host('reduced-motion', 1440, 900, '1280', { reducedMotion: 'reduce' }),
  ],
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

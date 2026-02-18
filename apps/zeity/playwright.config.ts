import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';
import type { ConfigOptions } from '@nuxt/test-utils/playwright';

export default defineConfig<ConfigOptions>({
  testDir: './test/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  timeout: 120_000,
  use: {
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  projects: [
    {
      name: 'chromium-headless-shell',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

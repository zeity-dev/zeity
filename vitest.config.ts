import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['./apps/*/vitest.config.ts', './libs/*/vitest.config.ts'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'cobertura'],
    },
  },
});

import { defineVitestConfig } from '@nuxt/test-utils/config';
import { fileURLToPath } from 'url';

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL('.', import.meta.url)),
        domEnvironment: 'happy-dom',
      },
    },

    coverage: {
      enabled: true,
      provider: 'v8',
    },
    include: ['test/nuxt/**/*.(test|spec).ts'],
    globals: true,
  },
  // any custom Vitest config you require
});

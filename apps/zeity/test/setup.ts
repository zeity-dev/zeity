import { mockNuxtImport } from '@nuxt/test-utils/runtime';

// Mock useI18n globally for all tests
mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
    locale: 'en',
  });
});

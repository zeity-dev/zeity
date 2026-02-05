import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    'apps/zeity': {
      entry: [
        'app/app.vue!',
        'app/error.vue!',
        'app/pages/**/*.vue!',
        'app/layouts/**/*.vue!',
        'app/components/**/*.vue!',
        'app/composables/**/*.ts!',
        'app/middleware/**/*.ts!',
        'app/plugins/**/*.ts!',
        'app/schemas/**/*.ts!',
        'app/stores/**/*.ts!',
        'app/types/**/*.ts!',
        'app/utils/**/*.ts!',
        'service-worker/**/*.ts!',
        'app/app.config.ts!',
        'server/mail/**/*.vue!',
        'server/**/*.ts!',
        'shared/**/*.ts!',
        'i18n/**/*.ts',
      ],
      project: ['**/*.{ts,vue,cjs,mjs}', '!test/fixtures/**'],
      ignoreDependencies: [
        '@iconify-json/*',
        'consola',
        'pinia',
        'h3',
        'tailwindcss',
        'reka-ui',
        '@tanstack/vue-table',
        'sharp',
      ],
    },
    'apps/docs': {
      entry: [
        'app/components/**/*.vue!',
        'app/app.config.ts!',
        'i18n/**/*.json',
      ],
      project: ['**/*.{ts,vue,cjs,mjs}', '!test/fixtures/**'],
      ignoreDependencies: ['@iconify-json/*', '@nuxt/hints', 'docus'],
    },
    'libs/*': {
      entry: ['src/**/*.ts!'],
      project: ['**/*.{ts,vue,cjs,mjs}', '!test/fixtures/**'],
    },
  },
};

export default config;

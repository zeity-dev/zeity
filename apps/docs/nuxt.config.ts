const baseUrl = 'https://www.zeity.dev';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  experimental: {
    viewTransition: true,
  },

  extends: ['docus'],
  modules: [
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    'nuxt-og-image',
    'nuxt-schema-org',
    '@nuxt/icon',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/content',
    'nuxt-security',
  ],

  i18n: {
    baseUrl: baseUrl,
    defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en-US', name: 'English' },
      // { code: 'de', language: 'de-DE', name: 'Deutsch' },
    ],
    strategy: 'prefix',
  },

  content: {
    experimental: { nativeSqlite: true },
  },
  ogImage: {
    zeroRuntime: true,
  },
  sitemap: {
    zeroRuntime: true,
  },
  robots: {
    allow: ['*'],
  },

  icon: {
    customCollections: [
      {
        prefix: 'zeity',
        dir: './public/icons',
      },
    ],
    clientBundle: {
      scan: true,
    },
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'script-src': [
          "'wasm-unsafe-eval'",
          "'strict-dynamic'", // Modify with your custom CSP sources
          "'nonce-{{nonce}}'",
        ],
      },
    },
  },

  site: {
    name: 'Zeity',
    url: baseUrl,
  },

  routeRules: {
    '/*': { prerender: true },
  },

  devtools: {
    enabled: true,
  },

  typescript: {
    strict: false,
  },
});

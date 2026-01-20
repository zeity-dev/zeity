const isProd = process.env.NODE_ENV === 'production';
const baseUrl = 'https://www.zeity.dev';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  future: {
    compatibilityVersion: 4,
    typescriptBundlerResolution: true,
  },
  experimental: {
    viewTransition: true,
  },
  modules: [
    '@nuxt/hints',
    '@nuxt/eslint',
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    'nuxt-og-image',
    'nuxt-schema-org',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/content',
    'nuxt-security',
  ],
  css: ['~/assets/css/main.css'],
  content: {
    experimental: {
      nativeSqlite: true,
    },
  },
  i18n: {
    baseUrl: baseUrl,
    strategy: 'prefix',
    detectBrowserLanguage: {
      redirectOn: 'root',
      useCookie: false,
    },
    locales: [
      // {
      //   code: 'de',
      //   name: 'Deutsch',
      // },
      {
        code: 'en',
        name: 'English',
      },
    ],
    defaultLocale: 'en',
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
    provider: 'iconify',
  },
  robots: {
    enabled: true,
    // allow: ['*'],
    disallow: ['*'],
  },
  security: {
    enabled: isProd,
    headers: {
      contentSecurityPolicy: {
        'upgrade-insecure-requests': false,
      },
    },
  },
  site: {
    url: baseUrl,
    name: 'zeity',
  },
  nitro: {
    prerender: {
      routes: ['/', '/robots.txt'],
    },
  },
  routeRules: {
    '/de/docs/**': {
      redirect: '/en/docs/',
    },
  },
  devServer: {
    port: 4000,
  },
  devtools: {
    enabled: true,
  },
});

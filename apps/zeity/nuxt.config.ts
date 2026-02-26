// https://nuxt.com/docs/api/configuration/nuxt-config
import vuePlugin from '@vitejs/plugin-vue';

import packageJson from '../../package.json' with { type: 'json' };

const isProd = process.env.NODE_ENV === 'production';

export default defineNuxtConfig({
  compatibilityDate: '2026-01-31',
  future: {
    compatibilityVersion: 4,
    typescriptBundlerResolution: true,
  },
  experimental: {
    asyncContext: true,
    componentIslands: true,
    typescriptPlugin: true,
    viteEnvironmentApi: true,
    viewTransition: true,
  },
  modules: [
    '@nuxt/hints',
    '@nuxt/test-utils/module',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/ui',
    '@nuxt/image',
    'nuxt-security',
    'nuxt-auth-utils',
    '@vite-pwa/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  pwa: {
    registerType: 'autoUpdate',
    strategies: 'injectManifest',
    srcDir: '../service-worker',
    filename: 'sw.ts',
    injectRegister: 'auto',
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 60 * 5, // check for updates every 5 minutes
    },
    manifest: {
      scope: '/',
      name: 'zeity Time Tracker',
      short_name: 'zeity',
      description: 'Time tracking app app with excellent user experience',
      theme_color: '#00bbff',
      display: 'standalone',
      lang: 'en',
      icons: [
        {
          src: 'favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
        },
        {
          src: 'icons/logo-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icons/logo-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'icons/logo-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,webp,ico}'],
    },
    experimental: {
      enableWorkboxPayloadQueryParams: true,
    },
    devOptions: {
      enabled: !isProd,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
  i18n: {
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    locales: [
      {
        code: 'de',
        name: 'Deutsch',
      },
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
    // provider: 'iconify',
  },
  colorMode: {
    storageKey: 'zeity-color-mode',
  },
  auth: {
    webAuthn: true,
  },
  security: {
    enabled: isProd,
    headers: {
      contentSecurityPolicy: {
        'upgrade-insecure-requests': false,
      },
    },
    rateLimiter: {
      // Global rate limiting - generous for normal traffic
      tokensPerInterval: 150,
      interval: 6 * 10000, // 1 minute
      headers: true, // Send rate limit headers
      throwError: true,
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/offline': { prerender: true },
    '/user/**': {
      appMiddleware: ['auth'],
    },
    '/organisations/**': {
      appMiddleware: ['auth'],
    },
    '/api/auth/login': {
      security: {
        rateLimiter: {
          tokensPerInterval: 5,
          interval: 15 * 60 * 1000, // 15 minutes - 5 attempts per 15 min
          headers: true,
          throwError: true,
        },
      },
    },
    '/api/auth/register': {
      security: {
        rateLimiter: {
          tokensPerInterval: 3,
          interval: 60 * 60 * 1000, // 1 hour - 3 registrations per hour
          headers: true,
          throwError: true,
        },
      },
    },
    '/api/auth/forgot-password': {
      security: {
        rateLimiter: {
          tokensPerInterval: 3,
          interval: 60 * 60 * 1000, // 1 hour - 3 reset requests per hour
          headers: true,
          throwError: true,
        },
      },
    },
    '/api/auth/reset-password': {
      security: {
        rateLimiter: {
          tokensPerInterval: 5,
          interval: 60 * 60 * 1000, // 1 hour - 5 attempts per hour
          headers: true,
          throwError: true,
        },
      },
    },
    '/api/user/verify': {
      security: {
        rateLimiter: {
          tokensPerInterval: 5,
          interval: 60 * 60 * 1000, // 1 hour - 5 verification attempts per hour
          headers: true,
          throwError: true,
        },
      },
    },
    '/api/webauthn/**': {
      security: {
        rateLimiter: {
          tokensPerInterval: 10,
          interval: 5 * 60 * 1000, // 5 minutes - 10 attempts per 5 min
          headers: true,
          throwError: true,
        },
      },
    },
    '/api/**': {
      security: {
        rateLimiter: {
          tokensPerInterval: 100,
          interval: 60 * 1000, // 1 minute - 100 requests per minute
          headers: true,
          throwError: true,
        },
      },
    },
  },
  runtimeConfig: {
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/zeity',
    s3: {
      accessKey: 'storage',
      secretKey: 'storage123',
      endPoint: 'http://localhost:9000',
      bucket: 'zeity',
      region: 'auto',
    },
    mailer: {
      from: { email: 'noreply@zeity.dev', name: 'Zeity' },
      smtp: {
        host: 'localhost',
        port: 1025,
        user: undefined,
        password: undefined,
      },
    },
    organisation: {
      quota: {
        members: undefined,
      },
    },
    session: {
      password: crypto.randomUUID(),
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    jwtSecret: 'supersecret',
    public: {
      appName: 'zeity',
      stage: process.env.NODE_ENV || 'production',
      version: packageJson.version || '0.0.0',
      legal: {
        privacy: process.env.ZEITY_LEGAL_PRIVACY || undefined,
        terms: process.env.ZEITY_LEGAL_TERMS || undefined,
      },
      links: process.env.ZEITY_LINKS || undefined,
      allow: {
        organisation: {
          create: booleanEnv(process.env.ZEITY_ALLOW_ORGANISATION_CREATE, true),
        },
      },
    },
    nitro: {
      envPrefix: 'ZEITY_',
    },
  },
  nitro: {
    compressPublicAssets: true,
    experimental: {
      tasks: true,
    },
    rollupConfig: {
      plugins: [vuePlugin()],
    },
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    externals: {
      // bundle the S3 client in the server bundle as nitro does not support jsr packages yet
      // see: https://github.com/nitrojs/nitro/issues/3034
      inline: ['@bradenmacdonald/s3-lite-client'],
    },
  },

  vite: {
    optimizeDeps: {
      include: ['@vueuse/core'],
    },
  },

  devtools: { enabled: true },
});

function booleanEnv(value: string | undefined, defaultValue = false) {
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
}

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
    nitroAutoImports: false,
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
  $test: {
    pwa: {
      disable: true,
      pwaAssets: {
        disabled: true,
      },
    },
  },
  $production: {
    testUtils: {
      removeTestIdAttribute: true,
    },
  },
  css: ['~/assets/css/main.css'],
  appConfig: {
    buildDate: new Date().toISOString(),
  },
  pwa: {
    path: '~~/pwa.config.ts',
  },
  i18n: {
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'zeity_lang',
      alwaysRedirect: false,
    },
    locales: [
      {
        code: 'de',
        name: 'Deutsch',
        file: 'de.json',
      },
      {
        code: 'en',
        name: 'English',
        file: 'en.json',
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
    provider: 'server',
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
      name: 'zeity_session',
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
    imports: {
      autoImport: false,
    },
    rollupConfig: {
      plugins: [vuePlugin()],
    },
    esbuild: {
      options: {
        target: 'es2024',
      },
    },
    typescript: {
      strict: true,
    },
  },

  imports: {
    autoImport: false,
  },

  vite: {
    optimizeDeps: {
      include: ['@vueuse/core', 'qrcode.vue', 'xlsx', 'zod'],
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

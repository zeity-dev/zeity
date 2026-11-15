import { definePwaConfig } from '@vite-pwa/nuxt/config';

const isProd = process.env.NODE_ENV === 'production';

export default definePwaConfig({
  registerType: 'autoUpdate',
  strategies: 'buildSW',
  client: {
    installPrompt: true,
    periodicSyncForUpdates: 60 * 5, // check for updates every 5 minutes
  },
  manifest: {
    scope: '/',

    name: 'zeity Time Tracker',
    name_localized: {
      en: 'zeity Time Tracker',
      de: 'zeity Zeiterfassung',
    },

    short_name: 'zeity',
    short_name_localized: {
      en: 'zeity',
      de: 'zeity',
    },

    description: 'Time Tracking Made Simple',
    description_locales: {
      en: 'Time Tracking Made Simple',
      de: 'Zeiterfassung leicht gemacht',
    },

    theme_color: '#00bbff',
    display: 'standalone',
  },
  pwaAssets: {
    config: true,
    // config: false,
    // image: 'favicon.svg',
  },
  generateSW: {
    globPatterns: ['**/*.{js,css,html,png,svg,webp,ico}'],
  },
  buildSW: {
    swSrc: '~~/service-worker/sw.ts',
    globPatterns: ['**/*.{js,css,html,png,svg,webp,ico}'],
  },
  experimental: {
    enableWorkboxPayloadQueryParams: true,
  },
  devOptions: {
    enabled: !isProd,
    inspector: 'standalone',
    suppressWarnings: true,
    navigateFallback: '/',
    navigateFallbackAllowlist: [/^\/$/],
    type: 'module',
  },
});

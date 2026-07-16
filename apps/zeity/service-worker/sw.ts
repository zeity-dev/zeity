/// <reference lib="WebWorker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import type { TimerReminderSyncMessage } from '../shared/types/timerReminder';

declare let self: ServiceWorkerGlobalScope;

// self.__WB_MANIFEST is the default injection point
precacheAndRoute(self.__WB_MANIFEST, {
  ignoreURLParametersMatching: [/.*/],
});

// clean old assets
cleanupOutdatedCaches();

let allowlist: RegExp[] | undefined;
let denylist: RegExp[] | undefined;
// in dev mode, we disable precaching to avoid caching issues
if (import.meta.env.DEV) {
  allowlist = [/^\/$/];
}

if (import.meta.env.PROD) {
  const api = /^\/api\//;
  denylist = [api, /^\/auth\/.+/];

  const strategy = new NetworkFirst({
    cacheName: 'ssr-pages-caches',
    matchOptions: {
      ignoreVary: true,
      ignoreSearch: true,
    },
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      // we only need a few entries
      new ExpirationPlugin({ maxEntries: 100 }),
      {
        cachedResponseWillBeUsed: async (params) => {
          // When handlerDidError is invoked, then we can prevent redirecting if there is an entry in the cache.
          // To check the behavior, navigate to a product page, then disable the network and refresh the page.
          params.state ??= {};
          params.state.noRedirect = params.cachedResponse;
          console.log(
            `[SW] cachedResponseWillBeUsed ${params.request.url}, ${params.state ? JSON.stringify(params.state) : ''}`,
          );
        },
        // This callback will be called when the fetch call fails.
        // Beware of the logic, will be also invoked if the server is down.
        handlerDidError: async ({ request, state, error }) => {
          if (state?.noRedirect) return state.noRedirect;

          console.log(
            `[SW] handlerDidError ${request.url}, ${state ? JSON.stringify(state) : ''}`,
          );
          return error && 'name' in error && error.name === 'no-response'
            ? Response.redirect('/offline', 302)
            : undefined;
        },
      },
    ],
  });
  registerRoute(({ sameOrigin, request }) => {
    const url = new URL(request.url, self.origin);
    const allowedPages = [
      /^\/time/,
      /^\/projects/,
      /^\/settings/,
      /^\/about/,
      /^\/organisations/,
      /^\/user/,
      /^\/auth$/,
    ];
    const result =
      sameOrigin &&
      ((request.destination === 'document' &&
        allowedPages.some((path) => path.test(url.pathname))) ||
        api.test(url.pathname));

    console.log(`[SW] ${result ? 'Allow' : 'Deny'} ${url.pathname}`);

    return result;
  }, strategy);
}

// register prerendered app shell for navigation requests
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/'), { allowlist, denylist }),
);

self.skipWaiting();
clientsClaim();

// ---------------------------------------------------------------------------
// Timer reminder – runs in the SW so it fires even when the screen is off
// ---------------------------------------------------------------------------

let reminderTimeoutId: ReturnType<typeof setTimeout> | null = null;
// The draftStart for which a notification was already scheduled / sent,
// used to avoid creating duplicate timeouts for the same timer.
let scheduledForStart: string | null = null;

function clearReminderTimeout() {
  if (reminderTimeoutId !== null) {
    clearTimeout(reminderTimeoutId);
    reminderTimeoutId = null;
  }
  scheduledForStart = null;
}

async function scheduleReminder(draftStart: string, thresholdMs: number) {
  // If we already scheduled a reminder for this exact timer start, do nothing.
  if (scheduledForStart === draftStart) return;

  clearReminderTimeout();
  scheduledForStart = draftStart;

  const elapsed = Date.now() - new Date(draftStart).getTime();
  const delay = Math.max(0, thresholdMs - elapsed);

  reminderTimeoutId = setTimeout(async () => {
    reminderTimeoutId = null;
    await self.registration.showNotification('Timer still running', {
      body: 'Your timer has been running for a while. Did you forget to stop it?',
      icon: '/favicon.svg',
      tag: 'timer-reminder',
    });
  }, delay);
}

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const data = event.data as TimerReminderSyncMessage;
  if (data?.type !== 'TIMER_REMINDER_SYNC') return;

  if (!data.timerReminderEnabled || !data.draftStart) {
    clearReminderTimeout();
    return;
  }

  const thresholdMs = data.timerReminderThreshold * 60 * 60 * 1000;
  scheduleReminder(data.draftStart, thresholdMs);
});

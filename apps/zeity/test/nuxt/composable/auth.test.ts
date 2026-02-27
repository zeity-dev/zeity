import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime';

import { useAuth } from '~/composables/auth';

const { useUserSessionMock } = vi.hoisted(() => {
  return {
    useUserSessionMock: vi.fn(() => {
      return { loggedIn: ref(true), clear: vi.fn(), fetch: vi.fn() };
    }),
  };
});

mockNuxtImport('useUserSession', () => {
  return useUserSessionMock;
});

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

const addToastMock = vi.fn();
mockNuxtImport('useToast', () => {
  return () => ({
    add: addToastMock,
  });
});

const navigateToMock = vi.hoisted(() => vi.fn());
mockNuxtImport('navigateTo', () => {
  return navigateToMock;
});

describe('auth composable', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('refresh', () => {
    it('should refresh the session', async () => {
      registerEndpoint('/api/_auth/refresh', () => {
        return new Response(null, { status: 200 });
      });

      await expect(useAuth().refresh()).resolves.not.toThrow();
    });

    it('should handle session expiration', async () => {
      const sessionClearMock = vi.fn();
      useUserSessionMock.mockImplementationOnce(() => {
        return { loggedIn: ref(true), clear: sessionClearMock, fetch: vi.fn() };
      });

      registerEndpoint('/api/_auth/refresh', () => {
        return new Response('Unauthorized', {
          status: 401,
        });
      });

      await useAuth().refresh();

      expect(addToastMock).toHaveBeenCalledWith({
        title: 'auth.expired.title',
        description: 'auth.expired.description',
        color: 'warning',
        icon: 'i-lucide-alert-triangle',
      });
      expect(sessionClearMock).toHaveBeenCalled();
      expect(navigateToMock).toHaveBeenCalledWith('/auth');
    });
  });

  describe('logout', () => {
    it('should clear the session and navigate to auth page', async () => {
      const sessionClearMock = vi.fn();
      useUserSessionMock.mockImplementationOnce(() => {
        return { loggedIn: ref(true), clear: sessionClearMock, fetch: vi.fn() };
      });

      await useAuth().logout();

      expect(sessionClearMock).toHaveBeenCalled();
      expect(navigateToMock).toHaveBeenCalledWith('/auth');
    });
  });
});

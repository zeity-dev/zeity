import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import type { Ref } from 'vue';

import { useAuth } from '~/composables/auth';

const { useUserSessionMock } = vi.hoisted(() => ({
  useUserSessionMock: vi.fn(() => ({
    loggedIn: ref(true),
    clear: vi.fn(),
    fetch: vi.fn(),
  })),
}));

const fetchMock = vi.hoisted(() => vi.fn());
const navigateToMock = vi.hoisted(() => vi.fn());
const addToastMock = vi.hoisted(() => vi.fn());
const useIntervalFnMock = vi.hoisted(() => vi.fn());
const useDocumentVisibilityMock = vi.hoisted(() => vi.fn());
const useOnlineMock = vi.hoisted(() => vi.fn());

vi.mock('@vueuse/core', () => ({
  useIntervalFn: useIntervalFnMock,
  useDocumentVisibility: useDocumentVisibilityMock,
  useOnline: useOnlineMock,
}));

mockNuxtImport('useUserSession', () => useUserSessionMock);
mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }));
mockNuxtImport('useToast', () => () => ({ add: addToastMock }));
mockNuxtImport('useOrganisation', () => () => ({
  currentOrganisationId: ref(undefined),
  setCurrentOrganisationId: vi.fn(),
  getAllOrganisations: vi.fn(() => ref([])),
  findOrganisationById: vi.fn(() => ref(undefined)),
}));
mockNuxtImport('navigateTo', () => navigateToMock);
mockNuxtImport('$fetch', () => fetchMock);

describe('auth composable', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useUserSessionMock.mockImplementation(() => ({
      loggedIn: ref(true),
      clear: vi.fn(),
      fetch: vi.fn(),
    }));
  });

  describe('refresh', () => {
    it('should refresh the session', async () => {
      fetchMock.mockResolvedValueOnce(null);
      await expect(useAuth().refresh()).resolves.not.toThrow();
      expect(fetchMock).toHaveBeenCalledWith('/api/_auth/refresh');
    });

    it('should handle session expiration', async () => {
      const sessionClearMock = vi.fn();
      useUserSessionMock.mockImplementationOnce(() => ({
        loggedIn: ref(true),
        clear: sessionClearMock,
        fetch: vi.fn(),
      }));
      fetchMock.mockRejectedValueOnce(
        Object.assign(new Error('Unauthorized'), { response: { status: 401 } }),
      );

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

    it('should not logout on network error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Failed to fetch'));

      await useAuth().refresh();

      expect(addToastMock).not.toHaveBeenCalled();
      expect(navigateToMock).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear the session and navigate to auth page', async () => {
      const sessionClearMock = vi.fn();
      useUserSessionMock.mockImplementationOnce(() => ({
        loggedIn: ref(true),
        clear: sessionClearMock,
        fetch: vi.fn(),
      }));

      await useAuth().logout();

      expect(sessionClearMock).toHaveBeenCalled();
      expect(navigateToMock).toHaveBeenCalledWith('/auth');
    });
  });

  describe('startSessionKeepAlive', () => {
    let visibilityRef: Ref<DocumentVisibilityState>;
    let onlineRef: Ref<boolean>;
    let intervalFn: () => void;

    beforeEach(() => {
      visibilityRef = ref<DocumentVisibilityState>('visible');
      onlineRef = ref(true);
      useDocumentVisibilityMock.mockReturnValue(visibilityRef);
      useOnlineMock.mockReturnValue(onlineRef);
      fetchMock.mockResolvedValue(null);
      useIntervalFnMock.mockImplementation((fn: () => void) => {
        intervalFn = fn;
      });
    });

    it('should refresh when visibility becomes visible and online', async () => {
      visibilityRef.value = 'hidden';
      useAuth().startSessionKeepAlive();

      visibilityRef.value = 'visible';
      await nextTick();

      expect(fetchMock).toHaveBeenCalledWith('/api/_auth/refresh');
    });

    it('should not refresh when visibility becomes visible but offline', async () => {
      onlineRef.value = false;
      visibilityRef.value = 'hidden';
      useAuth().startSessionKeepAlive();

      visibilityRef.value = 'visible';
      await nextTick();

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should refresh on interval when online and logged in', async () => {
      useAuth().startSessionKeepAlive();
      await intervalFn();

      expect(fetchMock).toHaveBeenCalledWith('/api/_auth/refresh');
    });

    it('should not refresh on interval when offline', async () => {
      onlineRef.value = false;
      useAuth().startSessionKeepAlive();
      await intervalFn();

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should not refresh on interval when logged out', async () => {
      useUserSessionMock.mockImplementation(() => ({
        loggedIn: ref(false),
        clear: vi.fn(),
        fetch: vi.fn(),
      }));
      useAuth().startSessionKeepAlive();
      await intervalFn();

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});

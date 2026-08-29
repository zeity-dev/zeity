import type { FetchError } from 'ofetch';
import { useDocumentVisibility, useIntervalFn, useOnline } from '@vueuse/core';

export function useAuth() {
  const { t } = useI18n();
  const toast = useToast();
  const { loggedIn, clear } = useUserSession();

  async function refresh() {
    if (!loggedIn.value) return;
    await $fetch('/api/_auth/refresh').catch(async (error: FetchError) => {
      // network error while offline — don't logout
      if (!error.response) return;

      toast.add({
        title: t('auth.expired.title'),
        description: t('auth.expired.description'),
        color: 'warning',
        icon: 'i-lucide-alert-triangle',
      });
      await logout();
    });
  }

  async function logout() {
    useOrganisation().currentOrganisationId.value = undefined;
    await clear();
    await navigateTo('/auth');
  }

  function startSessionKeepAlive() {
    const online = useOnline();
    const visibility = useDocumentVisibility();

    watch(visibility, current => {
      if (current === 'visible' && online.value) {
        refresh();
      }
    });

    // refresh session periodically to prevent expiry during long sessions
    useIntervalFn(
      () => {
        if (online.value && loggedIn.value) {
          refresh();
        }
      },
      30 * 60 * 1000,
    );
  }

  return {
    isLoggedIn: loggedIn,
    refresh,
    logout,
    startSessionKeepAlive,
  };
}

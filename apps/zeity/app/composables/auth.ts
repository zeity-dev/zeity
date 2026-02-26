export function useAuth() {
  const { t } = useI18n();
  const toast = useToast();
  const { loggedIn, clear } = useUserSession();

  async function refresh() {
    if (loggedIn.value) {
      await $fetch('/api/_auth/refresh').catch(async () => {
        toast.add({
          title: t('auth.expired.title'),
          description: t('auth.expired.description'),
          color: 'warning',
          icon: 'i-lucide-alert-triangle',
        });

        await logout();
      });
    }
  }

  async function logout() {
    useOrganisation().currentOrganisationId.value = undefined;
    await clear();
    await navigateTo('/auth');
  }

  return {
    isLoggedIn: loggedIn,

    refresh,
    logout,
  };
}

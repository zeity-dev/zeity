export function useAuth() {
  const { loggedIn, clear } = useUserSession();

  function refresh() {
    if (loggedIn.value) {
      $fetch('/api/_auth/refresh');
    }
  }

  async function logout() {
    useOrganisation().currentOrganisationId.value = undefined;
    await clear();
    reloadNuxtApp();
  }

  return {
    isLoggedIn: loggedIn,

    refresh,
    logout,
  };
}

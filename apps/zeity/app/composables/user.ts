import type { User } from '@zeity/database/user';
import type { LocalOrganisation, LocalUser } from '~/types/local-user';

export function useUser() {
  const { clear } = useUserSession();
  const userStore = useUserStore();
  const organisationsStore = useOrganisationStore();
  const userStoreRefs = storeToRefs(useUserStore());

  function updateUserAndOrganisations(
    user: LocalUser | null = null,
    organisations: LocalOrganisation[] = []
  ) {
    userStore.setUser(user || null);
    organisationsStore.setOrganisations(organisations || []);
  }

  function reset() {
    updateUserAndOrganisations(null, []);
  }

  function fetchUser() {
    return useLazyFetch('/api/user/current').then((result) => {
      userStore.setLoading(result.pending.value);

      if (result.status.value === 'success') {
        const { user, organisations } = result?.data.value || {};
        updateUserAndOrganisations(
          user as LocalUser,
          organisations as LocalOrganisation[]
        );
        return result;
      }

      if (result.error.value?.data.statusCode === 401) {
        clear();
      }

      return result;
    });
  }

  async function reloadUser() {
    userStore.setLoading(true);
    return $fetch('/api/user/current', { timeout: 10_000 })
      .then((result) => {
        const { user, organisations } = result || {};
        updateUserAndOrganisations(
          user as LocalUser,
          organisations as LocalOrganisation[]
        );
        return result;
      })
      .catch((error) => {
        console.error('fetchUser error', error);
        if (error?.statusCode === 401) {
          clear();
        }
        throw error;
      })
      .finally(() => {
        userStore.setLoading(false);
      });
  }

  async function deleteUser() {
    return $fetch('/api/user/current', {
      method: 'delete',
      timeout: 10_000,
    }).then(async () => {
      await useUserSession().clear();
    });
  }

  function updateUser(data: Partial<User>) {
    return $fetch('/api/user/current', {
      method: 'PATCH',
      body: data,
      timeout: 10_000,
    }).then(async (data) => {
      await useUserSession().fetch();
      return data;
    });
  }

  function uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return $fetch('/api/user/image', {
      method: 'POST',
      body: formData,
      timeout: 10_000,
    });
  }

  return {
    loading: userStoreRefs.loading,
    user: userStoreRefs.user,
    setUser: userStore.setUser,
    reset,

    fetchUser,
    reloadUser,
    updateUser,
    uploadImage,
    deleteUser,
  };
}

import type { User } from '@zeity/database/user';
import type { LocalOrganisation, LocalUser } from '~/types/local-user';

function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return $fetch('/api/user/image', {
    method: 'POST',
    body: formData,
  });
}

export function useUser() {
  const { clear, fetch } = useUserSession();
  const organisationsStore = useOrganisationStore();
  const userStore = useUserStore();
  const userStoreRefs = storeToRefs(userStore);

  function updateUserAndOrganisations(
    user: LocalUser | null = null,
    organisations: LocalOrganisation[] = [],
  ) {
    userStore.setUser(user || null);
    organisationsStore.setOrganisations(organisations || []);
  }

  function reset() {
    updateUserAndOrganisations(null, []);
  }

  function fetchUser() {
    userStore.setLoading(true);

    return useLazyFetch('/api/user/current')
      .then(result => {
        if (result.status.value === 'success') {
          const { user, organisations } = result?.data.value || {};
          updateUserAndOrganisations(user as LocalUser, organisations as LocalOrganisation[]);
          return result;
        }

        console.error('Error fetching user:', result.error.value);
        const errorStatus = result.error.value?.status;
        if (errorStatus === 401) {
          clear();
        }

        return result;
      })
      .finally(() => {
        userStore.setLoading(false);
      });
  }

  async function reloadUser() {
    userStore.setLoading(true);
    return $fetch('/api/user/current')
      .then(result => {
        const { user, organisations } = result || {};
        updateUserAndOrganisations(user as LocalUser, organisations as LocalOrganisation[]);
        return result;
      })
      .catch(error => {
        console.error('fetchUser error', error);
        const fetchError = error as { status?: number; statusCode?: number } | undefined;
        if (fetchError?.statusCode === 401 || fetchError?.status === 401) {
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
      method: 'DELETE',
    }).then(async () => {
      await clear();
    });
  }

  function updateUser(data: Partial<User>) {
    return $fetch('/api/user/current', {
      method: 'PATCH',
      body: data,
    }).then(async data => {
      await fetch();
      return data;
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

import type { User } from '@zeity/database/user';
import type { LocalOrganisation, LocalUser } from '~/types/local-user';
import type { SettingsState } from '~/types/settings';

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
  const userStore = useUserStore();
  const settingsStore = useSettingsStore();
  const organisationsStore = useOrganisationStore();
  const userStoreRefs = storeToRefs(useUserStore());

  function updateUserAndOrganisations(
    user: LocalUser | null = null,
    organisations: LocalOrganisation[] = [],
    settings: SettingsState[] = [],
  ) {
    userStore.setUser(user || null);
    organisationsStore.setOrganisations(organisations || []);
    settingsStore.upsertUserSettings(settings || []);
  }

  function reset() {
    updateUserAndOrganisations(null, [], []);
  }

  function fetchUser() {
    return useLazyFetch('/api/user/current').then(result => {
      userStore.setLoading(result.pending.value);

      if (result.status.value === 'success') {
        const { user, organisations, settings } = result?.data.value || {};
        updateUserAndOrganisations(
          user as LocalUser,
          organisations as LocalOrganisation[],
          settings as SettingsState[],
        );
        return result;
      }

      if (result.error.value?.data?.statusCode === 401) {
        clear();
      }

      return result;
    });
  }

  async function reloadUser() {
    userStore.setLoading(true);
    return $fetch('/api/user/current')
      .then(result => {
        const { user, organisations, settings } = result || {};
        updateUserAndOrganisations(
          user as LocalUser,
          organisations as LocalOrganisation[],
          settings as SettingsState[],
        );
        return result;
      })
      .catch(error => {
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

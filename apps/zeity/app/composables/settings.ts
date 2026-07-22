import type { SettingsState } from '~/types/settings';

function patchSettings(orgId: string, data: Partial<SettingsState>): Promise<SettingsState> {
  return $fetch(`/api/user/settings/${orgId}`, {
    method: 'PATCH',
    body: data,
  });
}

export function useSettings() {
  const store = useSettingsStore();
  const { settings } = storeToRefs(store);
  const { loggedIn } = useUserSession();
  const { currentOrganisationId } = useOrganisation();

  async function updateSettings(data: Partial<SettingsState>) {
    if (loggedIn.value && currentOrganisationId.value) {
      const updatedSettings = await patchSettings(currentOrganisationId.value, data);
      store.upsertUserSettings([updatedSettings]);
    }

    store.updateSettings(data);
  }

  function updateSetting<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    return updateSettings({ [key]: value });
  }

  // load and save settings to localStorage needs to be done in the setup function, otherwise locale will be overwritten by the i18n module
  async function init() {
    const i18n = useI18n();

    store.loadFromLocalStorage();

    const { status, data } = await useLazyFetch<SettingsState[]>('/api/user/settings', {
      enabled: () => loggedIn.value,
      watch: [() => loggedIn.value],
    });

    watch(
      () => status.value === 'success' && data.value,
      userSettings => {
        if (userSettings) {
          store.upsertUserSettings(userSettings);
        }
      },
      { immediate: true },
    );

    watch(
      currentOrganisationId,
      value => {
        const orgSettings = store.allSettings.find(setting => setting.organisationId === value);
        if (orgSettings) {
          store.updateSettings(orgSettings);
        }
      },
      { immediate: true },
    );

    watch(
      () => settings.value.locale,
      value => {
        i18n.setLocale(value);
      },
      { immediate: true },
    );

    watch(
      () => settings.value.themeMode,
      value => {
        useColorMode().preference = value || 'system';
      },
      { immediate: true },
    );

    watch(
      () => settings.value.themeColor,
      value => {
        updateAppConfig({
          ui: {
            colors: {
              primary: value || 'sky',
            },
          },
        });
      },
      { immediate: true },
    );
  }

  return {
    init,

    settings,

    updateSettings,
    updateSetting,
  };
}

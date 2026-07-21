import type { SettingsState } from '~/types/settings';

function patchSettings(data: Partial<SettingsState>): Promise<SettingsState> {
  return $fetch(`/api/user/settings`, {
    method: 'PATCH',
    body: data,
  });
}

export function useSettings() {
  const store = useSettingsStore();
  const { settings } = storeToRefs(store);
  const { currentOrganisationId } = useOrganisation();

  async function updateSettings(data: Partial<SettingsState>) {
    if (currentOrganisationId.value) {
      const updatedSettings = await patchSettings(data);
      store.upsertUserSettings([updatedSettings]);
    }

    store.updateSettings(data);
  }

  function updateSetting<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    return updateSettings({ [key]: value });
  }

  return {
    settings,

    updateSettings,
    updateSetting,
  };
}

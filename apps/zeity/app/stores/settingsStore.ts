import { defineStore } from 'pinia';
import type { SettingsState } from '~/types/settings';

const defaultSettings: SettingsState = {
  id: 'local',

  locale: 'en',
  themeMode: 'system',
  themeColor: 'sky',
  openTimeDetailsOnStart: false,
  openTimeDetailsOnStop: false,
  calculateBreaks: false,
  roundTimes: false,

  organisationId: null,
};

export const useSettingsStore = defineStore('settings', () => {
  const { currentOrganisationId } = storeToRefs(useOrganisationStore());

  const userSettingsStore = useEntityStore<SettingsState>('userSettings');
  userSettingsStore.setEntities([defaultSettings]);

  function upsertUserSettings(settings: SettingsState[]) {
    userSettingsStore.upsertMany(settings);
  }

  const locale = shallowRef(defaultSettings.locale);
  const themeMode = shallowRef(defaultSettings.themeMode);
  const themeColor = shallowRef(defaultSettings.themeColor);

  const openTimeDetailsOnStart = shallowRef(defaultSettings.openTimeDetailsOnStart);
  const openTimeDetailsOnStop = shallowRef(defaultSettings.openTimeDetailsOnStop);
  const calculateBreaks = shallowRef(defaultSettings.calculateBreaks);
  const roundTimes = shallowRef(defaultSettings.roundTimes);

  const settings = computed<SettingsState>(() => ({
    id: 'local',

    locale: locale.value,
    themeMode: themeMode.value,
    themeColor: themeColor.value,
    openTimeDetailsOnStart: openTimeDetailsOnStart.value,
    openTimeDetailsOnStop: openTimeDetailsOnStop.value,
    calculateBreaks: calculateBreaks.value,
    roundTimes: roundTimes.value,

    organisationId: currentOrganisationId.value ?? null,
  }));

  function updateSettings(data: Partial<SettingsState>) {
    if (data.locale !== undefined) {
      locale.value = data.locale;
    }

    if (data.themeMode !== undefined) {
      themeMode.value = data.themeMode;
    }
    if (data.themeColor !== undefined) {
      themeColor.value = data.themeColor;
    }

    if (data.openTimeDetailsOnStart !== undefined) {
      openTimeDetailsOnStart.value = data.openTimeDetailsOnStart;
    }
    if (data.openTimeDetailsOnStop !== undefined) {
      openTimeDetailsOnStop.value = data.openTimeDetailsOnStop;
    }

    if (data.calculateBreaks !== undefined) {
      calculateBreaks.value = data.calculateBreaks;
    }

    if (data.roundTimes !== undefined) {
      roundTimes.value = data.roundTimes;
    }
  }

  function loadFromLocalStorage() {
    const settings = useLocalStorage().getItem<SettingsState>('settings');
    if (!settings) return;

    updateSettings(settings);
  }

  // load and save settings to localStorage needs to be done in the setup function, otherwise locale will be overwritten by the i18n module
  function init() {
    const i18n = useI18n();

    loadFromLocalStorage();

    watch(settings, value => {
      useLocalStorage().setItem('settings', value);
    });

    watch(
      locale,
      value => {
        i18n.setLocale(value);
      },
      { immediate: true },
    );

    watch(
      themeMode,
      value => {
        useColorMode().preference = value || 'system';
      },
      { immediate: true },
    );

    watch(
      currentOrganisationId,
      value => {
        const orgSettings = userSettingsStore
          .find(setting => setting.organisationId === value)
          .value.at(0);
        if (orgSettings) {
          updateSettings(orgSettings);
        }
      },
      { immediate: true },
    );
  }

  return {
    init,

    settings,
    updateSettings,

    locale,
    themeMode,
    themeColor,

    openTimeDetailsOnStart,
    openTimeDetailsOnStop,
    calculateBreaks,
    roundTimes,

    loadFromLocalStorage,

    upsertUserSettings,
  };
});

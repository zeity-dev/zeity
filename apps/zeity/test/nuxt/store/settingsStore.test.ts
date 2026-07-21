import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

import { useSettingsStore } from '../../../app/stores/settingsStore';

const { useColorMode } = vi.hoisted(() => ({
  useColorMode: () => ({
    value: 'dark',
    preference: 'system',
  }),
}));
mockNuxtImport('useColorMode', () => useColorMode);

const { useI18n } = vi.hoisted(() => ({
  useI18n: () => {
    const locale = ref('en');
    return {
      locale,
      setLocale: (val: string) => {
        locale.value = val;
      },
    };
  },
}));
mockNuxtImport('useI18n', () => useI18n);

describe('useSettingsStore', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setActivePinia(createPinia());
  });

  it('should have a default state', () => {
    const store = useSettingsStore();
    expect(store.settings).toMatchSnapshot();
  });

  describe('localStorage', () => {
    it('should load settings from localStorage', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue(
        JSON.stringify({ locale: 'fr', themeMode: 'dark', themeColor: 'red' })
      );

      const store = useSettingsStore();
      store.loadFromLocalStorage();

      expect(store.settings).toMatchSnapshot();
    });

    it('should save settings to localStorage', async () => {
      const spy = vi.spyOn(localStorage, 'setItem');
      const store = useSettingsStore();

      store.init();
      store.updateSettings({ locale: 'de' });

      await nextTick();

      expect(spy).toHaveBeenCalledWith(
        'settings',
        JSON.stringify({
          id: 'local',
          locale: 'de',
          themeMode: 'system',
          themeColor: 'sky',
          openTimeDetailsOnStart: false,
          openTimeDetailsOnStop: false,
          calculateBreaks: false,
          roundTimes: false,
          organisationId: null,
        })
      );
    });
  });

  describe('updateSettings', () => {
    it('should update settings', () => {
      const store = useSettingsStore();
      store.updateSettings({ locale: 'de' });

      expect(store.settings).toMatchSnapshot();
    });
  });
});

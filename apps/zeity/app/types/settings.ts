import type { Locale } from '~/types/lang';

export interface SettingsState {
  id: string;
  locale: Locale;
  themeMode: string;
  themeColor: string;
  openTimeDetailsOnStart: boolean;
  openTimeDetailsOnStop: boolean;
  calculateBreaks: boolean;
  roundTimes: boolean;

  organisationId: string | null;
}

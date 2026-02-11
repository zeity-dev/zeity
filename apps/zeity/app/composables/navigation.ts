import type { NavigationMenuItem } from '@nuxt/ui';

export function useNavigation() {
  const { t } = useI18n();
  const { isStarted } = storeToRefs(useTimerStore());

  const openMoreMenu = ref(false);
  const verticalMenu = computed<NavigationMenuItem[][]>(() => [
    [
      {
        label: t('navigation.timer'),
        to: '/time',
        icon: 'i-lucide-clock',
        badge: isStarted.value
          ? { color: 'primary', variant: 'solid' }
          : undefined,
      },
      {
        label: t('navigation.projects'),
        to: '/projects',
        icon: 'i-lucide-list-todo',
      },
      // {
      //     label: 'Tags',
      //     to: '/tags',
      //     icon: 'i-lucide-tag',
      // },
      {
        label: t('navigation.reports'),
        to: '/reports',
        icon: 'i-lucide-chart-pie',
      },
      {
        label: t('navigation.settings'),
        to: '/settings',
        icon: 'i-lucide-settings',
      },
    ],
    [
      {
        label: t('navigation.about'),
        to: '/about',
        icon: 'i-lucide-info',
      },
    ],
  ]);

  const horizontalMenu = computed<NavigationMenuItem[]>(() => [
    {
      label: t('navigation.timer'),
      to: '/time',
      icon: 'i-lucide-clock',
      chip: isStarted.value
        ? { color: 'primary', variant: 'solid' }
        : undefined,
    },
    {
      label: t('navigation.projects'),
      to: '/projects',
      icon: 'i-lucide-list-todo',
    },
    {
      label: t('navigation.reports'),
      to: '/reports',
      icon: 'i-lucide-chart-pie',
    },
    {
      label: t('navigation.more'),
      icon: 'i-lucide-more-horizontal',
      onSelect: () => {
        openMoreMenu.value = true;
      },
    },
  ]);

  return {
    openMoreMenu,
    verticalMenu,
    horizontalMenu,
  };
}

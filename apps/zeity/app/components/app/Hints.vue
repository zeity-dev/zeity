<script setup lang="ts">
const pwa = usePWA();
const { t } = useI18n();
const { loggedIn } = useUserSession();

const closedHints = ref<string[]>([]);

const availableHints = computed(() => {
  const result = [];

  if (!loggedIn.value) {
    result.push({
      id: 'auth-hint',
      color: 'neutral' as const,
      icon: 'i-lucide-lock',
      title: t('hints.auth.title'),
      description: t('hints.auth.description'),
      actions: [
        {
          icon: 'i-lucide-log-in',
          label: t('hints.auth.login'),
          to: '/auth',
        },
      ],
    });
  }

  if (!pwa?.isPWAInstalled && !pwa?.showInstallPrompt) {
    result.push({
      id: 'pwa-hint',
      color: 'neutral' as const,
      icon: 'i-lucide-smartphone',
      title: t('hints.pwa.title'),
      description: t('hints.pwa.description'),
      actions: [
        {
          icon: 'i-lucide-download',
          label: t('hints.pwa.install'),
          onselect: () => pwa?.install(),
        },
      ],
    });
  }

  if (pwa?.needRefresh) {
    result.push({
      id: 'pwa-refresh-hint',
      color: 'neutral' as const,
      icon: 'i-lucide-smartphone',
      title: t('hints.pwaRefresh.title'),
      description: t('hints.pwaRefresh.description'),
      actions: [
        {
          icon: 'i-lucide-refresh-cw',
          label: t('hints.pwaRefresh.refresh'),
          onselect: () => pwa?.updateServiceWorker(),
        },
      ],
    });
  }

  return result;
});

const hint = computed(() =>
  availableHints.value
    .filter((hint) => !closedHints.value.includes(hint.id))
    .at(0),
);

function closeHint() {
  closedHints.value.push(hint.value?.id || '');
}
</script>

<template>
  <UAlert
    v-if="hint"
    :key="hint.id"
    :icon="hint.icon"
    :color="hint.color"
    :title="hint.title"
    :description="hint.description"
    :actions="hint.actions"
    variant="outline"
    close
    @update:open="(value) => !value && closeHint()"
  />
</template>

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
  <div class="isolate">
    <AppHeader />

    <UContainer>
      <div
        class="grid md:flex md:gap-4 min-h-[calc(100dvh-var(--ui-header-height))] divide-x divide-default"
      >
        <aside
          class="hidden md:block shrink-0 sticky top-(--ui-header-height) max-h-[calc(100vh-var(--ui-header-height))] md:w-44 lg:w-52 xl:w-60 overflow-y-auto py-4"
        >
          <AppAsideNavigation />
        </aside>

        <main class="grow shrink min-w-0 pt-2 pb-17 md:py-3">
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

          <slot />
        </main>
      </div>
    </UContainer>

    <AppBottomNavigation class="md:hidden" />
  </div>
</template>

<style>
:root {
  --ui-header-height: calc(var(--spacing) * 16);
}
</style>

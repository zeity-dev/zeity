<script setup lang="ts">
const { loggedIn } = useUserSession();

const closedHints = ref({
  auth: false,
  pwaInstall: false,
  pwaRefresh: false,
});
</script>

<template>
  <div class="relative flex w-full snap-x snap-mandatory gap-6 overflow-x-auto">
    <UAlert
      v-if="!closedHints.auth && !loggedIn"
      :title="$t('hints.auth.title')"
      :description="$t('hints.auth.description')"
      :actions="[
        {
          icon: 'i-lucide-log-in',
          label: $t('hints.auth.login'),
          to: '/auth',
        },
      ]"
      icon="i-lucide-lock"
      color="neutral"
      variant="outline"
      class="shrink-0 snap-center"
      close
      @update:open="closedHints.auth = true"
    />

    <UAlert
      v-if="
        !closedHints.pwaInstall && $pwa?.showInstallPrompt && !$pwa?.needRefresh
      "
      :title="$t('hints.pwaInstall.title')"
      :description="$t('hints.pwaInstall.description')"
      :actions="[
        {
          icon: 'i-lucide-download',
          label: $t('hints.pwaInstall.install'),
          onClick: () => {
            $pwa?.install();
          },
        },
      ]"
      icon="i-lucide-smartphone"
      color="neutral"
      variant="outline"
      class="shrink-0 snap-center"
      close
      @update:open="closedHints.pwaInstall = true"
    />

    <UAlert
      v-if="!closedHints.pwaRefresh && $pwa?.needRefresh"
      :title="$t('hints.pwaRefresh.title')"
      :description="$t('hints.pwaRefresh.description')"
      :actions="[
        {
          icon: 'i-lucide-refresh-cw',
          label: $t('hints.pwaRefresh.refresh'),
          onClick: () => {
            $pwa?.updateServiceWorker();
          },
        },
      ]"
      icon="i-lucide-smartphone"
      color="neutral"
      variant="outline"
      class="snap-center"
      close
      @update:open="closedHints.pwaRefresh = true"
    />
  </div>
</template>

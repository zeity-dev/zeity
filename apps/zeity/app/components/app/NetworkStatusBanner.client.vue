<script setup lang="ts">
const { isOnline } = useNetworkStatus();
const toast = useToast();
const { t } = useI18n();

const wasOffline = ref(false);

watch(isOnline, (online) => {
  if (!online) {
    wasOffline.value = true;
  } else if (wasOffline.value) {
    wasOffline.value = false;
    toast.add({
      color: 'success',
      icon: 'i-lucide-wifi',
      title: t('network.reconnected.title'),
      description: t('network.reconnected.description'),
      duration: 4000,
    });
  }
});
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300"
    enter-from-class="opacity-0 -translate-y-2"
    leave-active-class="transition-all duration-300"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <UAlert
      v-if="!isOnline"
      color="warning"
      icon="i-lucide-wifi-off"
      :title="$t('network.offline.title')"
      :description="$t('network.offline.description')"
      class="rounded-none"
    />
  </Transition>
</template>

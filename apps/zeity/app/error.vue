<script setup>
const props = defineProps({
  error: {
    type: Object,
    default: () => ({}),
  },
});

const { t } = useI18n();

const isDev = import.meta.dev;
const status = computed(() => props.error.statusCode || 500);

const title = computed(() => {
  switch (status.value) {
    case 404:
      return t('error.notFound.title');
    case 500:
      return t('error.serverError.title');
    case 503:
      return t('error.serviceUnavailable.title');
    default:
      return t('error.general.title');
  }
});
const description = computed(() => {
  switch (status.value) {
    case 404:
      return t('error.notFound.description');
    case 500:
      return t('error.serverError.description');
    case 503:
      return t('error.serviceUnavailable.description');
    default:
      // return t('error.general.description');
      return String(props.error?.message || '');
  }
});

useHead({
  htmlAttrs: {
    lang: useI18n().locale,
  },
  title: title.value,
  meta: [{ name: 'robots', content: 'noindex' }],
});

function handleError() {
  return clearError({ redirect: '/' });
}
</script>

<template>
  <NuxtLayout>
    <div class="grid place-content-center h-full p-4 gap-4">
      <div class="flex items-center gap-2 text-3xl">
        <UIcon name="i-lucide-octagon-alert" />
        {{ title }}
      </div>

      <div class="text-xl text-[var(--ui-text-dimmed)]">
        {{ description }}
      </div>

      <pre v-if="isDev" class="overflow-auto">{{ error }}</pre>

      <UButton block size="xl" @click="handleError"> Go Back </UButton>
    </div>
  </NuxtLayout>
</template>

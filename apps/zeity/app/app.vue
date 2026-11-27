<script setup lang="ts">
import { computed } from 'vue';
import { de, en } from '@nuxt/ui/locale';
import { useHead, useRuntimeConfig } from '#app';
import {
  Head,
  NuxtLayout,
  NuxtLoadingIndicator,
  NuxtPage,
  NuxtPwaManifest,
  UApp,
} from '#components';
import { useAuth } from '~/composables/auth';
import { useSettings } from '~/composables/settings';
import { useProjectStore } from '~/stores/projectStore';
import { useTimerStore } from '~/stores/timerStore';

const locales = {
  en,
  de,
};

const timerStore = useTimerStore();
const projectStore = useProjectStore();
const settings = useSettings();

timerStore.init();
projectStore.init();
await settings.init();

const isDev = import.meta.dev;
const uiLocale = computed(() => locales[settings.settings.value.locale] || en);
const lang = computed(() => uiLocale.value.code);
const dir = computed(() => uiLocale.value.dir);

useHead({
  htmlAttrs: {
    lang,
    dir,
  },
  title: useRuntimeConfig().public.appName,
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
});

const auth = useAuth();
auth.startSessionKeepAlive();
</script>

<template>
  <Head>
    <NuxtPwaManifest v-if="!isDev" />
  </Head>

  <UApp :locale="uiLocale">
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

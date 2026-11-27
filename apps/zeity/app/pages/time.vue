<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useHead } from '#app';
import { NuxtPage } from '#components';

useHead({
  title: useI18n().t('times.title'),
});
</script>

<template>
  <div class="flex flex-col h-full">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useHead } from '#app';
import { NuxtPage } from '#components';

useHead({
  title: useI18n().t('projects.title'),
});
</script>

<template>
  <NuxtPage />
</template>

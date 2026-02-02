<script setup lang="ts">
useHead({
  title: useI18n().t('times.title'),
});
</script>

<template>
  <div class="flex flex-col h-full">
    <NuxtPage />
  </div>
</template>

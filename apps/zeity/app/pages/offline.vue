<script setup lang="ts">
import { useHead } from '#app';
import { UButton } from '#components';

useHead({ title: 'Offline' });
</script>

<template>
  <main class="mx-auto text-center space-y-4 mt-6">
    <h1 class="text-2xl font-semibold">
      {{ $t('offline.title') }}
    </h1>
    <p class="mt-2 text-[var(--ui-text-dimmed)]">
      {{ $t('offline.description') }}
    </p>
    <UButton to="/">{{ $t('common.back') }}</UButton>
  </main>
</template>

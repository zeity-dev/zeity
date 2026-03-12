<script setup lang="ts">
useHead({
  title: useI18n().t('tasks.title'),
});

const { isLoggedIn } = useAuth();
</script>

<template>
  <div>
    <NuxtPage v-if="isLoggedIn" />

    <LazyUEmpty
      v-else
      :icon="'i-lucide-check-square'"
      :title="$t('tasks.loginPrompt.title')"
      :description="$t('tasks.loginPrompt.description')"
      :actions="[
        {
          label: $t('auth.login.title'),
          icon: 'i-lucide-log-in',
          to: '/auth',
        },
      ]"
      class="my-4"
    />
  </div>
</template>

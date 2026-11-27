<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '#app';
import { LazyUEmpty, NuxtPage } from '#components';
import { useAuth } from '~/composables/auth';
import { useOrganisation } from '~/composables/organisation';

useHead({
  title: useI18n().t('tasks.title'),
});

const { isLoggedIn } = useAuth();
const { currentOrganisationId } = useOrganisation();

const hasOrganisation = computed(() => !!currentOrganisationId.value);
</script>

<template>
  <div>
    <NuxtPage v-if="isLoggedIn && hasOrganisation" />

    <LazyUEmpty
      v-if="!isLoggedIn"
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

    <LazyUEmpty
      v-else-if="!hasOrganisation"
      :icon="'i-lucide-building-2'"
      :title="$t('tasks.noOrganisation.title')"
      :description="$t('tasks.noOrganisation.description')"
      :actions="[
        {
          label: $t('organisations.create'),
          icon: 'i-lucide-plus',
          to: '/organisations/create',
        },
      ]"
      class="my-4"
    />
  </div>
</template>

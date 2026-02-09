<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const { t } = useI18n();
const token = useRoute().query.token as string;

const { status, data } = await useLazyFetch('/api/organisation/join', {
  query: {
    token,
  },
  server: false,
});
const isLoading = computed(() => ['pending', 'idle'].includes(status.value));

async function acceptInvite() {
  await $fetch(`/api/organisation/join/accept`, {
    method: 'POST',
    query: {
      token,
    },
  })
    .then(() => {
      return useToast().add({
        title: t('common.success'),
        description: t('organisations.join.acceptSuccess'),
        color: 'success',
      });
    })
    .then(async () => await navigateTo('/user'))
    .catch((error) => {
      console.error(error);
      useToast().add({
        title: t('common.error'),
        description: t('organisations.join.acceptError'),
        color: 'error',
      });
    });
}
</script>

<template>
  <UPageCard
    :title="$t('organisations.join.title')"
    class="max-w-full w-lg m-auto"
  >
    <div v-if="isLoading" class="flex flex-col items-center gap-4">
      <USkeleton class="rounded-full h-16 w-16" />
      <USkeleton class="h-8 w-64" />
      <USkeleton class="h-4 max-w-full w-80" />
      <USkeleton class="h-8 w-32" />
    </div>
    <div v-else-if="status === 'success'" class="space-y-4">
      <div
        v-if="data?.organisation"
        class="flex flex-col items-center gap-3 m-auto"
      >
        <OrganisationImage :org="data.organisation" />
        <h2 class="text-2xl font-semibold">{{ data.organisation.name }}</h2>
        <i18n-t keypath="organisations.join.description" tag="p">
          <template #organisation>
            <b>{{ data.organisation?.name }}</b>
          </template>
        </i18n-t>
        <div>
          <UButton
            block
            icon="i-lucide-check"
            :label="$t('organisations.join.accept')"
            @click="acceptInvite"
          />
        </div>
      </div>
    </div>
    <div v-else>
      <UAlert
        color="error"
        :title="$t('common.error')"
        :description="$t('organisations.join.error')"
        :actions="[
          {
            label: $t('navigation.user'),
            to: '/user',
            color: 'neutral',
          },
        ]"
      />
    </div>
  </UPageCard>
</template>

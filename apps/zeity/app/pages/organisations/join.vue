<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const { t } = useI18n();
const token = useRoute().query.token as string;

const { status, data } = await useFetch('/api/organisation/join-request', {
  query: {
    token,
  },
});

const message = ref('');

const canApply = computed(
  () => data.value && !data.value.isMember && !data.value.requested,
);

async function requestJoin() {
  await $fetch(`/api/organisation/join-request`, {
    method: 'POST',
    body: {
      token,
      message: message.value,
    },
  })
    .then(() => {
      return useToast().add({
        title: t('common.success'),
        description: t('organisations.join.request.success'),
        color: 'success',
      });
    })
    .then(async () => await navigateTo('/user'))
    .catch((error) => {
      console.error(error);
      useToast().add({
        title: t('common.error'),
        description: t('organisations.join.request.error'),
        color: 'error',
      });
    });
}
</script>

<template>
  <UPageCard
    :title="$t('organisations.join.title')"
    class="max-w-lg m-auto my-8"
  >
    <div v-if="data?.organisation" class="flex flex-col items-center gap-3">
      <OrganisationImage :org="data.organisation" />
      <h2 class="text-2xl font-semibold">{{ data.organisation.name }}</h2>

      <!-- disable for now... -->
      <!-- <UFormField
        v-if="canApply"
        v-model="message"
        class="w-full"
        :label="$t('organisations.join.request.messageLabel')"
        :placeholder="$t('organisations.join.request.messagePlaceholder')"
      >
        <UTextarea
          v-model="message"
          class="w-full"
          :placeholder="$t('organisations.join.request.messagePlaceholder')"
        />
      </UFormField> -->
    </div>

    <UAlert
      v-if="status === 'error'"
      color="error"
      icon="i-lucide-x-circle"
      :title="$t('organisations.join.invalidLink')"
    />

    <UAlert
      v-if="data?.isMember"
      color="neutral"
      icon="i-lucide-user-check"
      :title="$t('organisations.join.alreadyMember')"
    />

    <UAlert
      v-if="data?.requested"
      color="neutral"
      icon="i-lucide-clock"
      :title="$t('organisations.join.request.pending')"
    />

    <UButton
      v-if="canApply"
      block
      icon="i-lucide-send"
      :label="$t('organisations.join.request.title')"
      @click="requestJoin"
    />
    <UButton
      v-else
      block
      icon="i-lucide-chevron-left"
      to="/user"
      :label="$t('common.back')"
    />
  </UPageCard>
</template>

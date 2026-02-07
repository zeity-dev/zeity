<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

definePageMeta({
  middleware: 'guest',
});

const pending = ref(false);

const { t } = useI18n();
const toast = useToast();

const schema = z.object({
  email: z.string().email().trim(),
});
type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({
  email: '',
});

async function submit(event: FormSubmitEvent<Schema>) {
  pending.value = true;

  await $fetch('/api/auth/forgot-password', {
    method: 'POST',
    body: event.data,
  })
    .then(async () => {
      toast.add({
        title: t('auth.forgotPassword.success'),
        color: 'success',
      });
      await useUserSession().fetch();
    })
    .catch(() => {
      toast.add({
        title: t('auth.forgotPassword.error'),
        color: 'error',
      });
    })
    .finally(() => {
      pending.value = false;
    });
}
</script>

<template>
  <UPageCard
    :title="$t('auth.forgotPassword.title')"
    class="max-w-md m-auto my-3"
  >
    <UForm
      class="space-y-4 max-w-lg"
      :schema="schema"
      :state="state"
      @submit.prevent="submit"
    >
      <UFormField :label="$t('user.email')">
        <UInput
          v-model="state.email"
          name="email"
          type="email"
          autocomplete="email"
          class="w-full"
        />
      </UFormField>

      <UButton
        block
        type="submit"
        :label="$t('auth.resetPassword.title')"
        :loading="pending"
      />
    </UForm>
  </UPageCard>
</template>

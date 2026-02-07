<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

definePageMeta({
  middleware: 'guest',
  validate(route) {
    // Check if the id is made up of digits
    return typeof route.query.token === 'string';
  },
});

const route = useRoute();
if (!route.query.token) {
  await navigateTo('/auth/forgot-password');
}

const { t } = useI18n();
const toast = useToast();

const pending = ref(false);
const passwordVisibility = ref(false);

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t('user.passwordsDoNotMatch'),
    path: ['confirmPassword'], // Highlights the confirm password field
  });
type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({
  password: '',
});

async function resetPassword(event: FormSubmitEvent<Schema>) {
  pending.value = true;

  await $fetch('/api/auth/reset-password', {
    method: 'POST',
    body: {
      code: route.query.token,
      password: event.data.password,
    },
  })
    .then(async () => {
      toast.add({
        title: t('auth.resetPassword.success'),
        color: 'success',
      });
      await useUserSession().fetch();
      await navigateTo('/user');
    })
    .catch(() => {
      toast.add({
        title: t('auth.resetPassword.error'),
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
    :title="$t('auth.resetPassword.title')"
    class="max-w-md m-auto my-3"
  >
    <UForm
      class="space-y-4"
      :schema="schema"
      :state="state"
      @submit.prevent="resetPassword"
    >
      <UFormField name="password" :label="$t('user.password')">
        <UInput
          v-model="state.password"
          autocomplete="new-password"
          class="w-full"
          :type="passwordVisibility ? 'text' : 'password'"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="passwordVisibility ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-pressed="passwordVisibility"
              @click="passwordVisibility = !passwordVisibility"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField name="confirmPassword" :label="$t('user.confirmPassword')">
        <UInput
          v-model="state.confirmPassword"
          autocomplete="new-password"
          class="w-full"
          :type="passwordVisibility ? 'text' : 'password'"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="passwordVisibility ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-pressed="passwordVisibility"
              @click="passwordVisibility = !passwordVisibility"
            />
          </template>
        </UInput>
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

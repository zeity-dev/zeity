<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const pending = ref(false);
const emits = defineEmits(['submit']);

const { t } = useI18n();
const toast = useToast();

const showPasswordStep = ref(true);
const passwordVisibility = ref(false);

const baseSchema = z.object({
  email: z.email().trim(),
  name: z.string().min(1).trim(),
  password: z.string().min(8),
  confirmPassword: z.string(),
});
const schema = baseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: t('auth.passwordsDoNotMatch'),
    path: ['confirmPassword'], // Highlights the confirm password field
  },
);
type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({
  name: '',
  email: '',
  password: '',
});

function toggleShowPasswordStep() {
  if (!document.startViewTransition) {
    // Fallback: no fancy animation, just update state
    showPasswordStep.value = !showPasswordStep.value;
  } else {
    document.startViewTransition(() => {
      showPasswordStep.value = !showPasswordStep.value;
    });
  }
}

async function registerPassword(event: FormSubmitEvent<Schema>) {
  pending.value = true;

  await $fetch('/api/auth/register', {
    method: 'POST',
    body: event.data,
  })
    .then(() => {
      toast.add({
        title: t('auth.register.success'),
        color: 'success',
      });
      emits('submit');
    })
    .catch((error) => {
      if (error.data?.message === 'User already exists') {
        toast.add({
          title: t('auth.register.userExists'),
          color: 'error',
        });
        return;
      }
      toast.add({
        title: t('auth.register.error'),
        color: 'error',
      });
    })
    .finally(() => {
      pending.value = false;
    });
}

async function registerPasskey() {
  const event = baseSchema
    .pick({ email: true, name: true })
    .safeParse(state.value);
  if (!event.success) {
    return;
  }
  pending.value = true;
  await useWebAuthn()
    .register({
      userName: event.data.email,
      displayName: event.data.name,
    })
    .then(() => emits('submit'))
    .catch((error) => {
      toast.add({
        title: error.data?.message || error.message,
        description: error.data?.data?.issues[0]?.message || error.data?.data,
        color: 'error',
      });
    })
    .finally(() => {
      pending.value = false;
    });
}
</script>

<template>
  <UForm
    class="space-y-4"
    :schema="schema"
    :state="state"
    @submit.prevent="registerPassword"
  >
    <div v-show="showPasswordStep" class="slide space-y-4">
      <UFormField :label="$t('user.email')" required>
        <UInput
          v-model="state.email"
          type="email"
          name="email"
          autocomplete="username webauthn"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="$t('user.name')" required>
        <UInput v-model="state.name" name="name" class="w-full" />
      </UFormField>

      <UButton
        block
        type="button"
        :label="$t('common.continue')"
        @click="toggleShowPasswordStep"
      />
    </div>
    <div v-show="!showPasswordStep" class="slide space-y-4">
      <UFormField :label="$t('user.password')">
        <UInput
          v-model="state.password"
          name="password"
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

      <UFormField :label="$t('user.confirmPassword')">
        <UInput
          v-model="state.confirmPassword"
          name="confirmPassword"
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

      <div class="flex gap-2">
        <UButton
          :title="$t('common.back')"
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="subtle"
          @click="toggleShowPasswordStep"
        />
        <UButton
          block
          type="submit"
          :label="$t('auth.register.title')"
          :loading="pending"
        />
      </div>
    </div>

    <USeparator :label="$t('common.or')" />

    <UButton
      block
      type="button"
      color="neutral"
      :label="$t('auth.registerWithPasskey')"
      :loading="pending"
      @click="registerPasskey"
    />
  </UForm>
</template>

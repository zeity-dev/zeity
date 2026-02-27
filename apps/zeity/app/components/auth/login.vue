<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const pending = ref(false);
const emits = defineEmits(['submit']);

const { t } = useI18n();
const toast = useToast();

const showPasswordStep = ref(true);
const passwordVisibility = ref(false);

const schema = z.object({
  email: z.email().trim(),
  password: z.string().min(8),
});
type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({
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

async function loginPassword(event: FormSubmitEvent<Schema>) {
  if (event.data.email && !event.data.password) {
    toggleShowPasswordStep();
    return;
  }

  pending.value = true;

  await $fetch('/api/auth/login', {
    method: 'POST',
    body: event.data,
  })
    .then(() => {
      toast.add({
        title: t('auth.login.success'),
        color: 'success',
      });
      emits('submit');
    })
    .catch(() => {
      toast.add({
        title: t('auth.login.error'),
        color: 'error',
      });
    })
    .finally(() => {
      pending.value = false;
    });
}

async function loginPasskey() {
  const event = schema.pick({ email: true }).safeParse(state.value);
  if (!event.success) {
    return;
  }
  pending.value = true;

  await useWebAuthn()
    .authenticate(event.data.email)
    .then(() => {
      toast.add({
        title: t('auth.loginSuccess'),
        color: 'success',
      });
      emits('submit');
    })
    .catch((error) => {
      toast.add({
        title: error.data?.message || error.message,
        description: error.data?.data,
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
    @submit.prevent="loginPassword"
  >
    <div v-show="showPasswordStep" class="slide space-y-4">
      <UFormField name="email" :label="$t('user.email')">
        <UInput
          v-model="state.email"
          type="email"
          autocomplete="username webauthn"
          class="w-full"
        />
      </UFormField>

      <UButton
        block
        type="button"
        :label="$t('common.continue')"
        @click="toggleShowPasswordStep"
      />
    </div>
    <div v-show="!showPasswordStep" class="slide space-y-4">
      <UFormField name="password" :label="$t('user.password')">
        <UInput
          v-model="state.password"
          autocomplete="current-password"
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

        <template #hint>
          <ULink
            :to="`/auth/forgot-password?email=${state.email}`"
            class="text-sm text-primary-600 hover:underline"
          >
            {{ $t('auth.forgotPassword.title') }}
          </ULink>
        </template>
      </UFormField>

      <div class="flex gap-2">
        <UButton
          :title="$t('common.back')"
          :aria-label="$t('common.back')"
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="subtle"
          @click="toggleShowPasswordStep"
        />

        <UButton
          block
          type="submit"
          :label="$t('auth.login.title')"
          :loading="pending"
        />
      </div>
    </div>

    <USeparator :label="$t('common.or')" />

    <UButton
      block
      type="button"
      color="neutral"
      :label="$t('auth.loginWithPasskey')"
      :loading="pending"
      @click="loginPasskey"
    />
  </UForm>
</template>

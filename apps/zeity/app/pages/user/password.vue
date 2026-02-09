<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import z from 'zod';

definePageMeta({
  middleware: 'auth',
});

const props = defineProps({
  providers: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const emits = defineEmits(['refresh']);

const { t } = useI18n();
const toast = useToast();

const pending = ref(false);
const passwordVisibility = ref({
  current: false,
  new: false,
  confirm: false,
});

const hasPassword = computed(() => props.providers.includes('password'));

const schema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: t('user.passwordsDoNotMatch'),
    path: ['confirmPassword'], // Highlights the confirm password field
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: t('user.changePassword.newPasswordSameAsCurrent'),
    path: ['newPassword'], // Highlights the confirm password field
  });

type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

async function updatePassword(event: FormSubmitEvent<Schema>) {
  pending.value = true;

  await $fetch('/api/user/set-password', {
    method: 'POST',
    body: {
      currentPassword: event.data.currentPassword,
      newPassword: event.data.newPassword,
    },
  })
    .then(async () => {
      toast.add({
        title: t('user.changePassword.success'),
        color: 'success',
      });
      emits('refresh');
      await navigateTo('/user/security');
    })
    .catch(() => {
      toast.add({
        title: t('user.changePassword.error'),
        color: 'error',
      });
    })
    .finally(() => {
      pending.value = false;
    });
}
</script>

<template>
  <UPageCard :title="$t('user.changePassword.title')">
    <UForm
      class="space-y-4"
      :schema="schema"
      :state="state"
      @submit="updatePassword"
    >
      <UFormField
        v-if="hasPassword"
        name="currentPassword"
        :label="$t('user.changePassword.currentPassword')"
      >
        <UInput
          v-model="state.currentPassword"
          autocomplete="current-password"
          class="w-full"
          :type="passwordVisibility.current ? 'text' : 'password'"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="
                passwordVisibility.current ? 'i-lucide-eye-off' : 'i-lucide-eye'
              "
              :aria-pressed="passwordVisibility.current"
              @click="passwordVisibility.current = !passwordVisibility.current"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField
        name="newPassword"
        :label="$t('user.changePassword.newPassword')"
      >
        <UInput
          v-model="state.newPassword"
          autocomplete="new-password"
          class="w-full"
          :type="passwordVisibility.new ? 'text' : 'password'"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="
                passwordVisibility.new ? 'i-lucide-eye-off' : 'i-lucide-eye'
              "
              :aria-pressed="passwordVisibility.new"
              @click="passwordVisibility.new = !passwordVisibility.new"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField name="confirmPassword" :label="$t('user.confirmPassword')">
        <UInput
          v-model="state.confirmPassword"
          autocomplete="new-password"
          class="w-full"
          :type="passwordVisibility.confirm ? 'text' : 'password'"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="
                passwordVisibility.confirm ? 'i-lucide-eye-off' : 'i-lucide-eye'
              "
              :aria-pressed="passwordVisibility.confirm"
              @click="passwordVisibility.confirm = !passwordVisibility.confirm"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        block
        type="submit"
        :label="$t('common.save')"
        :loading="pending"
      />
    </UForm>
  </UPageCard>
</template>

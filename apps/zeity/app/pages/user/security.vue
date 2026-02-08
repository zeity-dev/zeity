<script setup lang="ts">
const props = defineProps({
  providers: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const emits = defineEmits(['refresh']);

const { t } = useI18n();
const toast = useToast();

const hasPasswordProvider = computed(() => {
  return props.providers.includes('password');
});

const providers = computed(() => {
  return props.providers
    .filter((provider) => provider !== 'password')
    .map((provider) => ({
      id: provider,
      label: t(`user.security.providers.${provider}.title`),
      description: t(`user.security.providers.${provider}.description`),
      icon: `i-simple-icons-${provider}`,
    }));
});

function deleteAccount(providerId: string) {
  return $fetch(`/api/user/provider/${providerId}`, {
    method: 'DELETE',
  })
    .then(() => {
      toast.add({
        title: t('user.security.providers.disconnectSuccess'),
        color: 'success',
      });
      emits('refresh');
    })
    .catch(() => {
      toast.add({
        title: t('user.security.providers.disconnectError'),
        color: 'error',
      });
    });
}
</script>

<template>
  <UPageCard :title="$t('user.security.title')">
    <UCard>
      <div class="flex items-center justify-between gap-2">
        <div class="flex gap-4 items-center">
          <UIcon name="i-lucide-rectangle-ellipsis" class="text-2xl" />
          <div>
            <p class="font-medium">
              {{ $t('user.security.providers.password.title') }}
            </p>
            <p class="text-sm text-dimmed">
              {{ $t('user.security.providers.password.description') }}
            </p>
          </div>
        </div>

        <UButton
          variant="subtle"
          color="neutral"
          :label="
            $t(
              hasPasswordProvider
                ? 'user.security.providers.password.change'
                : 'user.security.providers.password.setup',
            )
          "
          :to="'/user/password'"
        />
      </div>
    </UCard>

    <UCard v-for="provider in providers" :key="provider.label">
      <div class="flex items-center justify-between gap-2">
        <div class="flex gap-4 items-center">
          <UIcon :name="provider.icon" class="text-2xl" />
          <div>
            <p class="font-medium">
              {{ provider.label }}
            </p>
            <p class="text-sm text-dimmed">
              {{ provider.description }}
            </p>
          </div>
        </div>

        <UButton
          variant="subtle"
          color="neutral"
          :label="$t('user.security.providers.disconnect')"
          @click="deleteAccount(provider.id)"
        />
      </div>
    </UCard>
  </UPageCard>
</template>

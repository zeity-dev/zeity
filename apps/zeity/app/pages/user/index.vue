<script setup lang="ts">
import type { User } from '@zeity/database/user';
import type { Organisation } from '@zeity/database/organisation';

const props = defineProps({
  pending: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object as PropType<User>,
    required: true,
  },
  organisations: {
    type: Array as PropType<Organisation[]>,
    required: true,
  },
});

const user = ref<User>(props.user);

const { t } = useI18n();
const toast = useToast();
const { deleteUser } = useUser();
const deleteModalOpen = ref(false);

const noOrganisations = computed(() => {
  return (props.organisations.length ?? 0) < 1;
});

function logout() {
  useAuth().logout();
}

async function handleDeleteUser() {
  await deleteUser()
    .then(async () => {
      toast.add({
        color: 'success',
        title: t('user.delete.success'),
      });
      await navigateTo('/auth');
    })
    .catch((error) => {
      console.error(error);
      toast.add({
        color: 'error',
        title: t('user.delete.error'),
      });
    });
}
</script>

<template>
  <div class="space-y-6">
    <UPageCard>
      <template #header>
        <h3 class="text-lg font-semibold leading-6">
          {{ $t('user.title') }}
        </h3>
      </template>

      <div class="space-y-4">
        <UAlert
          v-if="noOrganisations"
          icon="i-lucide-circle-alert"
          color="primary"
          variant="subtle"
          title="Create Organisation"
          description="Create an organisation to start using zeity."
          :actions="[
            {
              label: $t('organisations.create'),
              icon: 'i-lucide-plus',
              to: '/organisations/create',
            },
          ]"
        />

        <UserForm v-model="user" :loading="pending" />

        <div class="flex flex-col gap-2 justify-between">
          <UButton
            color="neutral"
            block
            icon="i-lucide-arrow-left-from-line"
            @click="logout"
          >
            {{ $t('auth.logout') }}
          </UButton>
        </div>
      </div>
    </UPageCard>

    <UPageCard class="bg-gradient-to-tl from-error/10 from-5% to-default">
      <h3
        class="mb-1 inline-block text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200"
      >
        {{ $t('user.delete.title') }}
      </h3>

      <UModal
        v-model:open="deleteModalOpen"
        :title="$t('user.delete.title')"
        :description="$t('user.delete.description')"
      >
        <UButton
          block
          size="lg"
          variant="subtle"
          color="error"
          icon="i-lucide-triangle-alert"
          @click="deleteModalOpen = true"
        >
          {{ $t('user.delete.title') }}
        </UButton>

        <template #footer>
          <div class="flex justify-between w-full">
            <UButton
              type="button"
              variant="subtle"
              @click="deleteModalOpen = false"
            >
              {{ $t('common.cancel') }}
            </UButton>

            <UButton color="error" @click="handleDeleteUser">
              {{ $t('common.delete') }}
            </UButton>
          </div>
        </template>
      </UModal>
    </UPageCard>
  </div>
</template>

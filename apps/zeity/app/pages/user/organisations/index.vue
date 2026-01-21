<script setup lang="ts">
import type { Organisation } from '@zeity/database/organisation';
import type { User } from '@zeity/types';

defineProps({
  user: {
    type: Object as PropType<User>,
    required: true,
  },
  organisations: {
    type: Array as PropType<Organisation[]>,
    required: true,
  },
  pending: {
    type: Boolean,
    default: false,
  },
});
const { t } = useI18n();
const toast = useToast();
const { currentOrganisationId } = useOrganisation();

const { data: invites, refresh } = useLazyFetch('/api/user/invites');

function acceptInvite(inviteId: string) {
  return $fetch('/api/user/invites/accept', {
    method: 'POST',
    body: {
      inviteId,
    },
  })
    .then(async () => {
      toast.add({
        title: t('organisations.join.acceptSuccess'),
        color: 'success',
      });
      await refresh();
    })
    .catch((error) => {
      console.error(error);
      toast.add({
        title: t('organisations.join.acceptError'),
        color: 'error',
      });
    });
}
function rejectInvite(inviteId: string) {
  return $fetch('/api/user/invites/reject', {
    method: 'POST',
    body: {
      inviteId,
    },
  })
    .then(async () => {
      toast.add({
        title: t('organisations.join.rejectSuccess'),
        color: 'success',
      });
      await refresh();
    })
    .catch((error) => {
      console.error(error);
      toast.add({
        title: t('organisations.join.rejectError'),
        color: 'error',
      });
    });
}
</script>

<template>
  <div class="space-y-6">
    <UPageCard v-if="invites && invites.length">
      <h3 class="text-lg font-semibold leading-6">
        {{ $t('organisations.invites.title') }}
      </h3>

      <div v-for="invite in invites" :key="invite.id" class="space-y-3">
        <UCard>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <UAvatar
                size="lg"
                :src="getOrganisationImagePath(invite.organisation)"
                :alt="invite.organisation?.name"
              />
              <p class="line-clamp-3">{{ invite.organisation?.name }}</p>
            </div>
            <div>
              <UFieldGroup>
                <UTooltip :title="$t('organisations.join.accept')">
                  <UButton
                    icon="i-lucide-check"
                    color="primary"
                    variant="subtle"
                    @click="acceptInvite(invite.id)"
                  />
                </UTooltip>
                <UTooltip :title="$t('organisations.join.reject')">
                  <UButton
                    icon="i-lucide-x"
                    color="neutral"
                    variant="subtle"
                    @click="rejectInvite(invite.id)"
                  />
                </UTooltip>
              </UFieldGroup>
            </div>
          </div>
        </UCard>
      </div>
    </UPageCard>

    <UPageCard>
      <h3 class="text-lg font-semibold leading-6">
        {{ $t('user.organisation') }}
      </h3>
      <template v-if="pending">
        <USkeleton class="h-13.5 w-full" />
      </template>
      <template v-else-if="organisations.length">
        <URadioGroup
          v-model="currentOrganisationId"
          :items="organisations"
          value-key="id"
          label-key="name"
          variant="card"
        />
      </template>
      <template v-else>
        <p class="text-dimmed">
          {{ $t('organisations.empty.title') }}
        </p>
      </template>
    </UPageCard>
  </div>
</template>

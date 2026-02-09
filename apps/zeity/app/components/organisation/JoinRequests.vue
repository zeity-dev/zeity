<script setup lang="ts">
const props = defineProps<{
  organisationId: string;
}>();

const emit = defineEmits(['refresh']);

const { t } = useI18n();
const toast = useToast();

const { pending, data, refresh } = useFetch(
  () => `/api/organisation/${props.organisationId}/join-request`,
  {
    query: {
      status: 'pending',
    },
  },
);

function acceptRequest(requestId: string) {
  return $fetch(
    `/api/organisation/${props.organisationId}/join-request/${requestId}/accept`,
    {
      method: 'POST',
    },
  )
    .then(() => {
      toast.add({
        title: t('organisations.join.requests.accepted'),
        color: 'success',
      });
      refresh();
      emit('refresh');
    })
    .catch(() => {
      toast.add({
        title: t('organisations.join.requests.acceptFailed'),
        color: 'error',
      });
    });
}

function rejectRequest(requestId: string) {
  return $fetch(
    `/api/organisation/${props.organisationId}/join-request/${requestId}/reject`,
    {
      method: 'POST',
    },
  )
    .then(() => {
      toast.add({
        title: t('organisations.join.requests.rejected'),
        color: 'neutral',
      });
      refresh();
      emit('refresh');
    })
    .catch(() => {
      toast.add({
        title: t('organisations.join.requests.rejectFailed'),
        color: 'error',
      });
    });
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between">
      <h3 class="text-lg font-semibold leading-6">
        {{ $t('organisations.join.requests.title') }}
      </h3>

      <UButton
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-refresh-cw"
        :class="pending ? 'animate-spin' : ''"
        :disabled="pending"
        @click="refresh()"
      />
    </div>

    <div v-if="!data?.length">
      <p class="text-sm text-neutral-500">
        {{ $t('organisations.join.requests.noRequests') }}
      </p>
    </div>

    <div v-for="request in data" :key="request.id" class="space-y-3">
      <UCard>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <UAvatar
              size="lg"
              :src="getUserImagePath(request.user)"
              :alt="request.user?.name"
            />
            <p class="line-clamp-3">{{ request.user?.name }}</p>
          </div>
          <div>
            <UFieldGroup>
              <UTooltip :title="$t('organisations.join.accept')">
                <UButton
                  icon="i-lucide-check"
                  color="primary"
                  variant="subtle"
                  @click="acceptRequest(request.id)"
                />
              </UTooltip>
              <UTooltip :title="$t('organisations.join.reject')">
                <UButton
                  icon="i-lucide-x"
                  color="neutral"
                  variant="subtle"
                  @click="rejectRequest(request.id)"
                />
              </UTooltip>
            </UFieldGroup>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrganisationWithMembersAndInvites } from '~/types/organisation';

const props = defineProps({
  org: {
    type: Object as PropType<OrganisationWithMembersAndInvites>,
    required: true,
  },
});

const count = computed(() => {
  return props.org.members.length + props.org.invites.length;
});

const quotaExceeded = computed(() => {
  const userQuota = props.org.quota?.members;
  if (!userQuota) return false;

  return count.value > userQuota;
});

const quotaLimit = computed(() => {
  if (props.org.quota?.members === undefined) return Infinity;

  return props.org.quota?.members || 0;
});

const color = computed(() => {
  const userQuota = quotaLimit.value;
  if (!userQuota || count.value < userQuota) {
    return 'neutral';
  } else if (count.value === userQuota) {
    return 'warning';
  } else {
    return 'error';
  }
});
</script>

<template>
  <div class="space-y-2">
    <h3 class="text-lg font-semibold leading-3">
      {{ $t('organisations.quota.members') }}
    </h3>

    <UAlert
      v-if="quotaExceeded"
      color="error"
      icon="i-lucide-alert-circle"
      :title="$t('organisations.quota.exceeded.title')"
      :description="$t('organisations.quota.exceeded.description')"
    />

    <div
      class="text-lg text-center space-x-2 tabular-nums"
      :class="`text-${color}`"
    >
      <span class="font-bold">{{ count }}</span>
      <span>/</span>
      <span class="font-bold">
        {{ quotaLimit === Infinity ? '∞' : quotaLimit }}
      </span>
    </div>
    <UProgress
      v-if="quotaLimit !== Infinity"
      v-model="count"
      :max="quotaLimit"
      :color="color"
    />
  </div>
</template>

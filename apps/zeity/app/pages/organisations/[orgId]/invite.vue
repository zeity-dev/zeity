<script setup lang="ts">
import type { PropType } from 'vue';
import { UPageCard, USeparator } from '#components';
import OrganisationInvitesTable from '~/components/organisation/InvitesTable.vue';
import OrganisationJoinRequests from '~/components/organisation/JoinRequests.vue';
import OrganisationUserQuotaInfo from '~/components/organisation/UserQuotaInfo.vue';
import type { OrganisationWithStats } from '~/types/organisation';

defineProps({
  org: {
    type: Object as PropType<OrganisationWithStats>,
    required: true,
  },
});
const emit = defineEmits(['refresh']);
</script>

<template>
  <div class="space-y-6">
    <UPageCard v-if="org.quota.members">
      <OrganisationUserQuotaInfo :org="org" />
    </UPageCard>

    <OrganisationJoinRequests :organisation-id="org.id" @refresh="emit('refresh')" />

    <USeparator />

    <OrganisationInvitesTable :organisation-id="org.id" @refresh="emit('refresh')" />
  </div>
</template>

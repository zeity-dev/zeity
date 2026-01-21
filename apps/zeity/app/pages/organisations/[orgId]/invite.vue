<script setup lang="ts">
import type { OrganisationWithMembersAndInvites } from '~/types/organisation';

defineProps({
    org: {
        type: Object as PropType<OrganisationWithMembersAndInvites>,
        required: true
    }
})
const emit = defineEmits(['refresh'])
</script>

<template>
    <div class="space-y-6">
        <UPageCard v-if="org.quota.members">
            <OrganisationUserQuotaInfo :org="org" />
        </UPageCard>

        <OrganisationInvites :organisation-id="org.id" :invites="org?.invites || []" @refresh="emit('refresh')" />
    </div>
</template>
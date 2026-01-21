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

        <OrganisationMembers :organisation-id="org.id" :members="org.members || []" @refresh="emit('refresh')" />
    </div>
</template>
<script setup lang="ts">
import type { Organisation } from '@zeity/database/organisation';
import type { OrganisationMember } from '@zeity/database/organisation-member';
import type { OrganisationInvite } from '@zeity/database/organisation-invite';

const props = defineProps({
    org: {
        type: Object as PropType<Organisation & { members: OrganisationMember[], invites: OrganisationInvite[] }>,
        required: true
    },
})

const count = computed(() => {
    return props.org.members.length + props.org.invites.length;
});

const quotaLimit = computed(() => {
    if (props.org.quota?.members === undefined) return '∞';

    return props.org.quota?.members || 0;
});

const color = computed(() => {
    const userQuota = props.org.quota?.members;
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
    <UPageCard v-if="org.quota.members">
        <UAlert v-if="color === 'error'" color="error" icon="i-lucide-alert-circle"
            :title="$t('organisations.quota.exceeded.title')"
            :description="$t('organisations.quota.exceeded.description')" />
        <div>
            {{ $t('organisations.quota.members') }}:
            <span :class="`text-bold text-${color}`">{{ count }}</span> / {{ quotaLimit }}
        </div>
    </UPageCard>
</template>
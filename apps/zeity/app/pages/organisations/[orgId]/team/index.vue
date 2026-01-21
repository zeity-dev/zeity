<script setup lang="ts">
import type { Organisation } from '@zeity/database/organisation';

defineProps({
    org: {
        type: Object as PropType<Organisation>,
        required: true
    }
})
</script>

<template>
    <OrganisationTeamsList :organisation-id="org.id" />
</template>
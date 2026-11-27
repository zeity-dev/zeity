<script setup lang="ts">
import type { PropType } from 'vue';
import type { Organisation } from '@zeity/database/organisation';
import OrganisationTeamsList from '~/components/organisation/TeamsList.vue';

defineProps({
  org: {
    type: Object as PropType<Organisation>,
    required: true,
  },
});
</script>

<template>
  <OrganisationTeamsList :organisation-id="org.id" />
</template>

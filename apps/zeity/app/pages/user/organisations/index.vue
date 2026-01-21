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
const { currentOrganisationId } = useOrganisation();
</script>

<template>
  <UFormField :label="$t('user.organisation')" size="lg">
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
  </UFormField>
</template>

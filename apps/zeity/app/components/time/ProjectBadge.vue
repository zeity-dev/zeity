<script setup lang="ts">
import type { PropType } from 'vue';
import { UButton } from '#components';

const props = defineProps({
  time: {
    type: Object as PropType<Time | DraftTime | undefined | null>,
    required: false,
    default: null,
  },
});
</script>

<template>
  <UButton
    v-if="props.time?.projectId"
    size="xs"
    variant="link"
    color="neutral"
    icon="i-lucide-list-todo"
    :to="`/projects/${props.time?.projectId}`"
  />
</template>

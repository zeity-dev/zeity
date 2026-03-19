<script setup lang="ts">
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

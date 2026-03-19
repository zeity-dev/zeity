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
    v-if="props.time?.taskId"
    size="xs"
    variant="link"
    color="neutral"
    icon="i-lucide-clipboard-check"
    :to="`/tasks/${props.time?.taskId}`"
  />
</template>

<script setup lang="ts">
import { TIME_TYPE_BREAK, type DraftTime, type Time } from '@zeity/types/time';

const props = defineProps({
  time: {
    type: Object as PropType<Time | DraftTime | undefined | null>,
    required: false,
    default: null,
  },
});

const icon = computed(() => {
  const time = props.time;

  if (time?.type === TIME_TYPE_BREAK) {
    return 'i-lucide-coffee';
  }

  return 'i-lucide-clock';
});
</script>

<template>
  <UIcon :name="icon" />
</template>

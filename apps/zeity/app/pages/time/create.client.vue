<script setup lang="ts">
import { TIME_TYPE_MANUAL, type Time } from '@zeity/types/time';

const time = ref<Time>({
  id: 'new',
  type: TIME_TYPE_MANUAL,
  start: new Date().toISOString(),
  duration: 0,
  notes: '',
});
</script>

<template>
  <div class="grid py-3 my-3 h-full">
    <TimeForm v-model="time" />
  </div>
</template>

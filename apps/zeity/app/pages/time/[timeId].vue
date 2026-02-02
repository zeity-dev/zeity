<script setup lang="ts">
definePageMeta({
  validate: async (route) => {
    // Check if the id is made up of digits
    return typeof route.params.timeId === 'string';
  },
});

const timeId = useRoute().params.timeId as string;

const time = useTimerStore().findTimeById(timeId);

onMounted(() => {
  useTime().loadTime(timeId);
});
</script>

<template>
  <div class="grid py-3 my-3 h-full">
    <TimeForm v-if="time" v-model="time" />
  </div>
</template>

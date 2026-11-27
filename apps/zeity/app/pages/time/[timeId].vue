<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from '#app';
import { definePageMeta } from '#app/composables/pages';
import TimeForm from '~/components/time/Form.vue';
import { useTime } from '~/composables/time';
import { useTimerStore } from '~/stores/timerStore';

definePageMeta({
  validate: async route => {
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
  <div class="flex flex-col py-3 my-3 h-full">
    <TimeForm v-if="time" v-model="time" class="h-full" />
  </div>
</template>

<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui';
import type { DraftTime } from '@zeity/types';

const emits = defineEmits(['start', 'stop']);

const model = defineModel<DraftTime | null>();
const isStarted = computed(() => !!model.value);

const startTimeButton = {
  icon: 'i-ri-play-fill',
  onClick: () => onToggle(),
};
const stopTimeButton = {
  icon: 'i-ri-stop-fill',
  onClick: () => onToggle(),
};
const nextTimeButton = {
  icon: 'i-ri-skip-forward-fill',
  onClick: () => onStartNext(),
};

const buttons = computed(() => {
  if (!isStarted.value) {
    return [startTimeButton];
  }

  return [nextTimeButton, stopTimeButton];
});
const styledButtons = computed<ButtonProps[]>(() => {
  return buttons.value.map((button, index) => {
    if (index === buttons.value.length - 1) {
      return { ...button, size: 'xl', color: 'primary' };
    } else {
      return { ...button, size: 'md', color: 'neutral' };
    }
  });
});

async function onToggle() {
  toggleDraft();
}

async function onStartNext() {
  stopDraft();
  startDraft();
}

function toggleDraft() {
  if (isStarted.value) {
    stopDraft();
  } else {
    startDraft();
  }
}

function stopDraft() {
  emits('stop');
}

function startDraft() {
  emits('start');
}
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      v-for="button in styledButtons"
      :key="button.label"
      square
      class="rounded-full shadow-lg"
      :size="button.size"
      :color="button.color"
      :icon="button.icon"
      @click="button.onClick"
    />
  </div>
</template>

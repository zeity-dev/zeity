<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';

import { TIME_TYPE_BREAK, type DraftTime } from '@zeity/types';
import { nowWithoutMillis, timeDiff } from '@zeity/utils/date';

const emits = defineEmits(['start', 'stop']);
const model = defineModel<DraftTime | null>();

const isStarted = computed(() => !!model.value);

const diff = computed(() => {
  const start = model.value?.start;
  if (start) {
    return timeDiff(now.value, start);
  }
  return 0;
});
const icon = computed(() => {
  if (model.value?.type === TIME_TYPE_BREAK) {
    return 'i-lucide-coffee';
  }
  return null;
});

const now = ref(nowWithoutMillis());

const { pause, resume } = useIntervalFn(
  () => {
    now.value = nowWithoutMillis();
  },
  1000,
  { immediateCallback: true },
);

onMounted(() => {
  if (isStarted.value) {
    resume();
  }
});
onUnmounted(() => {
  pause();
});

watch(isStarted, (value) => {
  if (value === true) {
    resume();
  } else {
    pause();
  }
});
</script>

<template>
  <div class="relative m-2">
    <div class="rounded-md shadow bg-[var(--ui-bg-accented)]">
      <UButton
        type="button"
        variant="ghost"
        color="neutral"
        class="w-full h-12"
        size="xl"
        :icon="icon"
      >
        <DemoDurationFlowing
          v-model="diff"
          class="font-mono text-2xl tabular-nums lining-nums tracking-wide"
        />
      </UButton>
    </div>

    <div class="absolute bottom-1 right-1">
      <DemoToggleButton
        v-model="model"
        @start="emits('start')"
        @stop="emits('stop')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  TIME_TYPE_BREAK,
  TIME_TYPE_MANUAL,
  type DraftTime,
  type Time,
} from '@zeity/types';
import {
  formatDuration,
  nowWithoutMillis,
  sortDatesDescending,
  timeDiff,
} from '@zeity/utils/date';

const draft = ref<DraftTime | null>({
  start: nowWithoutMillis().toISOString(),
  type: TIME_TYPE_MANUAL,
  notes: '',
});
const times = ref<Time[]>([]);
const sortedTimes = computed(() =>
  times.value.toSorted((a, b) => sortDatesDescending(a.start, b.start)),
);

function onStopDraft() {
  times.value = [
    ...times.value,
    {
      id: crypto.randomUUID(),
      start: draft.value!.start,
      duration: timeDiff(nowWithoutMillis(), draft.value!.start),
      type: draft.value!.type,
      notes: draft.value!.notes,
    },
  ];

  draft.value = null;
}

function onStartDraft() {
  draft.value = {
    start: nowWithoutMillis().toISOString(),
    type: TIME_TYPE_MANUAL,
    notes: '',
  };
}
</script>

<template>
  <div
    class="w-full flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-md"
  >
    <div class="overflow-auto max-h-56">
      <UButton
        v-for="time in sortedTimes"
        :key="time.id"
        :disabled="time.type === TIME_TYPE_BREAK"
        type="button"
        variant="ghost"
        class="w-full flex items-center justify-between gap-2"
      >
        <div class="text-xs truncate text-[var(--ui-text-dimmed)]">
          <span>
            {{ time.notes || $t('demo.note') }}
          </span>
        </div>

        <div
          class="flex items-center gap-1 font-sans text-md text-[var(--ui-text-toned)]"
        >
          <span class="tabular-nums">
            {{ formatDuration(time.duration) }}
          </span>

          <DemoTimeType :time="time" />
        </div>
      </UButton>
    </div>
    <DemoDraft v-model="draft" @start="onStartDraft()" @stop="onStopDraft()" />
  </div>
</template>

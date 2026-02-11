<script setup lang="ts">
import { type DraftTime, type Time, TIME_TYPE_MANUAL } from '@zeity/types';
import { nowWithoutMillis, timeDiff } from '@zeity/utils/date';

const draft = ref<DraftTime | null>({
  start: nowWithoutMillis().toISOString(),
  type: TIME_TYPE_MANUAL,
  notes: '',
});
const times = ref<Time[]>([]);

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
  <ClientOnly>
    <div class="relative">
      <DemoDraft
        v-model="draft"
        @start="onStartDraft()"
        @stop="onStopDraft()"
      />
    </div>
    <template #placeholder>
      <USkeleton class="h-12 w-full rounded-md" />
    </template>
  </ClientOnly>
</template>

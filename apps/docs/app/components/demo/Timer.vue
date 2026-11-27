<script setup lang="ts">
import { ref } from 'vue';
import { ClientOnly, USkeleton } from '#components';
import { TIME_TYPE_MANUAL, type DraftTime, type Time } from '@zeity/types';
import { nowWithoutMillis, timeDiff } from '@zeity/utils/date';
import DemoDraft from '~/components/demo/Draft.vue';

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
      <DemoDraft v-model="draft" @start="onStartDraft()" @stop="onStopDraft()" />
    </div>
    <template #placeholder>
      <USkeleton class="h-12 w-full rounded-md" />
    </template>
  </ClientOnly>
</template>

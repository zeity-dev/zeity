<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { useIntervalFn } from '@vueuse/core';
import { addMilliseconds } from 'date-fns';
import { parseAbsolute, getLocalTimeZone } from '@internationalized/date';
import { nanoid } from 'nanoid';

import type { DraftTime, Time } from '@zeity/types/time';
import { PROJECT_STATUS_ACTIVE } from '@zeity/types/project';
import { nowWithoutMillis, timeDiff } from '@zeity/utils/date';
import { pick } from '@zeity/utils/object';

import { type Schema, schema } from '~/schemas/time-form';

const model = defineModel<Time | DraftTime | undefined>();

const { t } = useI18n();

const { loggedIn } = useUserSession();
const { loadProjects, getOrganisationProjects } = useProject();

loadProjects({ status: [PROJECT_STATUS_ACTIVE] });
const orgProjects = getOrganisationProjects();
const activeProjects = computed(() =>
  orgProjects.value.filter(
    (project) => project.status === PROJECT_STATUS_ACTIVE,
  ),
);
const projectItems = computed(() => {
  const projectOptions = activeProjects.value.map((project) => ({
    label: project.name,
    value: project.id,
  }));
  return [{ label: t('times.noProject'), value: undefined }, ...projectOptions];
});

const { syncOfflineTimes } = useSync();
const {
  createTime,
  updateTime,
  removeTime,
  stopDraft,
  roundTime,
  isOnlineTime,
} = useTime();
const timeStore = useTimerStore();

const isDraft = computed(() => isDraftValue(model.value));
const isOffline = computed(() => {
  if (!loggedIn.value) return false;
  const time = model.value;
  return isTimeValue(time) && !isOnlineTime(time);
});

const startDateRef = useTemplateRef('startDateRef');
const endDateRef = useTemplateRef('endDateRef');

const state = ref<Schema>();
const loading = ref(false);

const parsedState = computed(() => {
  if (!state.value) return;

  const val = state.value;
  const validated = schema.safeParse(val);
  if (!validated.success) {
    return null;
  }

  return parseSchema(val);
});

const diff = computed(() => {
  const time = parsedState?.value;

  if (!time) {
    return 0;
  }

  if (isTimeValue(time) && time.duration) {
    return time.duration;
  }

  const start = time?.start;
  const end = now.value;

  if (start && end) {
    return timeDiff(end, start);
  }

  return 0;
});

const now = ref(nowWithoutMillis());
const { pause, resume } = useIntervalFn(
  () => {
    now.value = nowWithoutMillis();
  },
  1000,
  { immediateCallback: true },
);

onUnmounted(() => {
  pause();
});

watch(
  isDraft,
  (value) => {
    if (value) {
      resume();
    } else {
      pause();
    }
  },
  { immediate: true },
);

if (model.value) {
  state.value = toState(model.value);
}

function toState(data?: DraftTime | Time): Schema | undefined {
  if (!data) return undefined;

  const clone = Object.assign({}, data);

  const tz = getLocalTimeZone();
  if (isTimeValue(clone)) {
    const start = new Date(clone.start);
    const end = addMilliseconds(start, clone.duration);

    return {
      id: clone.id,
      type: clone.type,
      start: parseAbsolute(clone.start, tz).set({ millisecond: 0 }),
      end: parseAbsolute(end.toISOString(), tz).set({ millisecond: 0 }),
      notes: clone.notes || '',
      projectId: clone.projectId || undefined,
    } satisfies Schema;
  } else if (isDraftValue(clone)) {
    return {
      ...clone,
      start: parseAbsolute(clone.start, tz).set({ millisecond: 0 }),
    } as Schema;
  }
}

async function handleSave(event: FormSubmitEvent<Schema>) {
  const time = parseSchema(event.data);
  return showLoading(async () => {
    if (!time) return;

    if (isDraftValue(time)) {
      timeStore.updateDraft(time);
    }

    if (isTimeValue(time)) {
      if (time.id === 'new') {
        const created = await createTime({ ...time, id: nanoid() });
        if (created) {
          state.value = toState(created);
        }
      } else {
        const updated = await updateTime(time.id, time);
        if (updated) {
          state.value = toState(updated);
        }
      }
    }
  });
}

function parseSchema(data: Schema) {
  let duration: number | undefined;

  const start = data.start.toAbsoluteString();
  const end = 'end' in data ? data.end.toAbsoluteString() : undefined;
  if (end) {
    duration = timeDiff(end, start);
  }

  let id: string | undefined;
  if ('id' in data) {
    id = data.id;
  }

  // Time contain id and duration
  if (id && duration) {
    return {
      ...pick(data, ['type', 'notes', 'projectId']),
      id,
      start,
      duration,
    } satisfies Time;
  }

  // otherwise, it's a draft
  return {
    ...pick(data, ['type', 'notes', 'projectId']),
    start,
  } satisfies DraftTime;
}

async function handleStop() {
  const time = await showLoading(stopDraft);
  if (time) {
    await navigateTo(`/time/${time.id}`);
    return;
  }
  await navigateTo('/time');
}

async function handleRemove() {
  await showLoading(async () => {
    if (isDraft.value) {
      timeStore.resetDraft();
    }

    if (isTimeValue(model.value)) {
      await removeTime(model.value.id);
    }
  });

  await navigateTo('/time');
}

async function handleRound() {
  const parsed = parsedState.value;
  if (!parsed) return;
  const time = roundTime(parsed);
  if (time) {
    state.value = toState(time);
  }
}

async function handleSync() {
  return showLoading(async () => {
    if (!model.value) return;

    const offlineTime = model.value as Time;
    const newTimes = await syncOfflineTimes([offlineTime.id]);
    const newTime = newTimes?.[0];
    if (!newTime) return;

    model.value = newTime;
  });
}

function isDraftValue(
  value: Time | DraftTime | Schema | undefined | null,
): value is DraftTime {
  return !!value && !('duration' in value) && !('end' in value);
}
function isTimeValue(
  value?: Time | DraftTime | Schema | undefined | null,
): value is Time {
  return !!value && ('duration' in value || 'end' in value);
}

function showLoading<T>(fn: () => Promise<T>): Promise<T> {
  loading.value = true;
  return fn().finally(() => {
    loading.value = false;
  });
}
</script>

<template>
  <UForm
    v-if="state"
    :scheme="schema"
    :state="state"
    class="flex flex-col justify-between md:justify-start gap-6"
    @submit="handleSave"
  >
    <div class="space-y-4">
      <div class="flex justify-between items-center gap-4">
        <div class="flex flex-1 justify-center items-center gap-2">
          <Transition appear>
            <UIcon
              v-if="loading"
              name="i-lucide-loader-2"
              class="animate-spin text-xl"
            />
          </Transition>
        </div>
        <div class="flex-2">
          <TimeDurationFlowing
            v-model="diff"
            class="flex justify-center font-mono text-2xl tabular-nums lining-nums tracking-wide"
          />
        </div>

        <div class="flex flex-1 justify-center items-center gap-2">
          <TimeType :time="model" />
        </div>
      </div>

      <div v-if="state?.start" class="grid grid-cols-2 gap-2">
        <UFormField
          ref="startDateRef"
          :label="$t('times.form.startDate')"
          name="start"
        >
          <UInputDate
            v-model="state.start"
            hide-time-zone
            granularity="day"
            class="w-full"
          >
            <template #trailing>
              <UPopover :reference="startDateRef?.$el">
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-calendar"
                  aria-label="Select a date"
                  class="px-0"
                />

                <template #content>
                  <UCalendar v-model="state.start" class="p-2" />
                </template>
              </UPopover>
            </template>
          </UInputDate>
        </UFormField>
        <UFormField :label="$t('times.form.startTime')" name="start">
          <UInputTime
            v-model="state.start"
            hide-time-zone
            granularity="second"
            class="w-full"
          />
        </UFormField>
      </div>

      <div
        v-if="state && 'end' in state && isTimeValue(state)"
        class="grid grid-cols-2 gap-2"
      >
        <UFormField
          ref="endDateRef"
          :label="$t('times.form.endDate')"
          name="end"
        >
          <UInputDate
            v-model="state.end"
            hide-time-zone
            granularity="day"
            class="w-full"
          >
            <template #trailing>
              <UPopover :reference="endDateRef?.$el">
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-calendar"
                  aria-label="Select a date"
                  class="px-0"
                />

                <template #content>
                  <UCalendar v-model="state.end" class="p-2" />
                </template>
              </UPopover>
            </template>
          </UInputDate>
        </UFormField>
        <UFormField :label="$t('times.form.endTime')" name="end">
          <UInputTime
            v-model="state.end"
            hide-time-zone
            granularity="second"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField :label="$t('times.form.project')" name="projectId">
        <USelectMenu
          v-model="state.projectId"
          value-key="value"
          :items="projectItems"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="$t('times.form.notes')" name="notes">
        <UTextarea
          v-model="state.notes"
          type="text"
          class="w-full"
          autoresize
        />
      </UFormField>
    </div>

    <div class="space-y-2">
      <div class="grid grid-cols-2 md:grid-cols-2 justify-evenly gap-2">
        <UButton
          v-if="!isDraft"
          type="button"
          color="neutral"
          variant="subtle"
          icon="i-lucide-trending-up-down"
          @click="handleRound"
        >
          {{ $t('times.round') }}
        </UButton>

        <UButton
          v-if="isDraft"
          type="button"
          color="neutral"
          variant="subtle"
          icon="i-lucide-square"
          :disabled="loading"
          @click="handleStop"
        >
          {{ $t('common.stop') }}
        </UButton>

        <UButton
          v-if="isOffline"
          type="button"
          color="neutral"
          variant="subtle"
          icon="i-lucide-cloud-upload"
          :disabled="loading"
          @click="handleSync"
        >
          {{ $t('common.sync') }}
        </UButton>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-2 justify-evenly gap-2">
        <UButton
          type="button"
          color="error"
          variant="subtle"
          icon="i-lucide-trash"
          :disabled="loading"
          @click="handleRemove"
        >
          {{ $t('common.delete') }}
        </UButton>

        <UButton
          type="submit"
          color="primary"
          variant="subtle"
          icon="i-lucide-check"
          :disabled="loading"
        >
          {{ $t('common.save') }}
        </UButton>
      </div>
    </div>
  </UForm>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

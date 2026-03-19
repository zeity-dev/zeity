<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import {
  type ZonedDateTime,
  getLocalTimeZone,
  parseAbsolute,
  toZoned,
} from '@internationalized/date';
import { z } from 'zod';

import {
  TASK_RECURRENCE_FREQUENCIES,
  TASK_RECURRENCE_MONTHLY,
  TASK_RECURRENCE_ONCE,
  TASK_RECURRENCE_WEEKLY,
} from '@zeity/types/task';
import { pick } from '@zeity/utils/object';
import { sortDatesAscending, timeDiff } from '@zeity/utils/date';

const props = defineProps({
  data: {
    type: Object as PropType<Schema>,
    required: true,
  },
});
const emits = defineEmits(['submit']);

const { t } = useI18n();

const startDateRef = useTemplateRef('startDateRef');
const recurrenceEndDateRef = useTemplateRef('recurrenceEndDateRef');

const schema = z.object({
  name: z.string().min(3).max(200).default(''),

  start: z.iso.datetime(),
  duration: z.number().nullable().optional(),
  projectId: z.string().nullable().optional(),
  notes: z.string().optional(),

  recurrenceFrequency: z.enum(TASK_RECURRENCE_FREQUENCIES).default(TASK_RECURRENCE_WEEKLY),
  recurrenceWeekdays: z.array(z.number().int().min(0).max(6)).default([]),
  recurrenceDayOfMonth: z.number().int().min(1).max(31).nullable().optional(),
  recurrenceEnd: z.string().nullable().optional(),
});
type Schema = z.output<typeof schema>;

const state = ref<Partial<Schema>>({
  name: '',
  start: '',
  duration: undefined,
  projectId: undefined,
  notes: '',
  recurrenceFrequency: TASK_RECURRENCE_WEEKLY,
  recurrenceWeekdays: [],
  recurrenceDayOfMonth: undefined,
  recurrenceEnd: undefined,
});

const startDate = ref<ZonedDateTime>();
const endDate = ref<ZonedDateTime | undefined>();
const recurrenceEndDate = ref<ZonedDateTime | undefined>();

watch(
  () => props.data,
  data => {
    if (data) {
      state.value = Object.assign({}, data);

      const tz = getLocalTimeZone();
      startDate.value = parseAbsolute(data.start, tz).set({ millisecond: 0 });

      if (data.duration) {
        endDate.value = startDate.value
          .copy()
          .add({ milliseconds: data.duration })
          .set({ millisecond: 0 });
      } else {
        endDate.value = undefined;
      }

      if (data.recurrenceEnd) {
        recurrenceEndDate.value = parseAbsolute(data.recurrenceEnd, tz).set({
          millisecond: 0,
        });
      }
    }
  },
  { immediate: true },
);

watch([startDate, endDate, recurrenceEndDate], ([newStart, newEnd, newRecurrenceEnd]) => {
  if (newStart) {
    state.value.start = newStart.toAbsoluteString();
  }

  if (newStart && newEnd) {
    const start = newStart?.toAbsoluteString();
    const end = newStart
      .copy()
      // take start date and set time to end time to avoid issues with end times
      .set(pick(newEnd, ['hour', 'minute', 'second']))
      .toAbsoluteString();
    // sort before calculating duration to avoid negative durations when end time is past midnight compared to start time
    const sorted = [start, end].toSorted(sortDatesAscending);
    state.value.duration = timeDiff(sorted[1]!, sorted[0]!);
  } else {
    state.value.duration = undefined;
  }

  if (newRecurrenceEnd) {
    state.value.recurrenceEnd = toZoned(newRecurrenceEnd, getLocalTimeZone()).toAbsoluteString();
  } else {
    state.value.recurrenceEnd = undefined;
  }
});

const frequencyItems = computed(() =>
  TASK_RECURRENCE_FREQUENCIES.map(freq => ({
    value: freq,
    label: t(`tasks.recurrence.${freq}`),
  })),
);

const weekdayItems = computed(() => [
  { value: 0, label: t('tasks.weekdays.sun') },
  { value: 1, label: t('tasks.weekdays.mon') },
  { value: 2, label: t('tasks.weekdays.tue') },
  { value: 3, label: t('tasks.weekdays.wed') },
  { value: 4, label: t('tasks.weekdays.thu') },
  { value: 5, label: t('tasks.weekdays.fri') },
  { value: 6, label: t('tasks.weekdays.sat') },
]);

function handleSubmit(event: FormSubmitEvent<Schema>) {
  emits('submit', event.data);
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="handleSubmit">
    <UFormField :label="$t('tasks.form.name')" name="name">
      <UInput v-model="state.name" class="w-full" />
    </UFormField>

    <UFormField ref="startDateRef" :label="$t('times.form.startDate')" name="start">
      <UInputDate v-model="startDate" hide-time-zone granularity="day" class="w-full">
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
              <UCalendar v-model="startDate" class="p-2" />
            </template>
          </UPopover>
        </template>
      </UInputDate>
    </UFormField>

    <UFormField :label="$t('times.form.startTime')" name="start">
      <UInputTime v-model="startDate" hide-time-zone granularity="second" class="w-full" />
    </UFormField>

    <UFormField :label="$t('times.form.endTime')" name="end">
      <UInputTime v-model="endDate" hide-time-zone granularity="second" class="w-full">
        <template #trailing>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-x"
            @click="endDate = undefined"
          />
        </template>
      </UInputTime>
    </UFormField>

    <UFormField :label="$t('times.form.project')" name="projectId">
      <ProjectSelect v-model="state.projectId" allow-null class="w-full" />
    </UFormField>

    <UFormField :label="$t('times.form.notes')" name="notes">
      <UTextarea v-model="state.notes" class="w-full" autoresize />
    </UFormField>

    <fieldset class="space-y-3">
      <legend class="text-sm font-medium">{{ $t('tasks.form.recurrence') }}</legend>

      <UFormField :label="$t('tasks.form.frequency')" name="recurrenceFrequency">
        <USelect v-model="state.recurrenceFrequency" :items="frequencyItems" class="w-full" />
      </UFormField>

      <UFormField
        v-if="state.recurrenceFrequency === TASK_RECURRENCE_WEEKLY"
        :label="$t('tasks.form.weekdays')"
        name="recurrenceWeekdays"
      >
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="day in weekdayItems"
            :key="day.value"
            :variant="state.recurrenceWeekdays?.includes(day.value) ? 'solid' : 'subtle'"
            :color="state.recurrenceWeekdays?.includes(day.value) ? 'primary' : 'neutral'"
            size="sm"
            @click="
              state.recurrenceWeekdays = state.recurrenceWeekdays?.includes(day.value)
                ? state.recurrenceWeekdays.filter(d => d !== day.value)
                : [...(state.recurrenceWeekdays || []), day.value]
            "
          >
            {{ day.label }}
          </UButton>
        </div>
      </UFormField>

      <UFormField
        v-if="state.recurrenceFrequency === TASK_RECURRENCE_MONTHLY"
        :label="$t('tasks.form.dayOfMonth')"
        name="recurrenceDayOfMonth"
      >
        <UInput
          v-model.number="state.recurrenceDayOfMonth!"
          type="number"
          :min="1"
          :max="31"
          class="w-full"
        />
      </UFormField>

      <UFormField
        v-if="state.recurrenceFrequency !== TASK_RECURRENCE_ONCE"
        :label="$t('tasks.form.recurrenceEnd')"
        name="recurrenceEndDate"
        ref="recurrenceEndDateRef"
      >
        <UInputDate v-model="recurrenceEndDate" hide-time-zone granularity="day" class="w-full">
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-x"
              @click="recurrenceEndDate = undefined"
            />

            <UPopover :reference="recurrenceEndDateRef?.$el">
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-calendar"
                :aria-label="$t('common.selectDate')"
                class="px-0"
              />

              <template #content>
                <UCalendar v-model="recurrenceEndDate" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </UFormField>
    </fieldset>

    <UButton block type="submit">
      {{ $t('common.save') }}
    </UButton>
  </UForm>
</template>

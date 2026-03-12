<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { type ZonedDateTime, getLocalTimeZone, parseAbsolute } from '@internationalized/date';
import { z } from 'zod';

import { TASK_RECURRENCE_FREQUENCIES } from '@zeity/types/task';
import { sortDatesAscending, timeDiff } from '@zeity/utils/date';
import { pick } from '@zeity/utils/object';

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

const recurrenceSchema = z.object({
  frequency: z.enum(TASK_RECURRENCE_FREQUENCIES).default('weekly'),
  weekdays: z.array(z.number().int().min(0).max(6)).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  endDate: z.string().nullable().optional(),
});

const schema = z.object({
  name: z.string().min(3).max(200).default(''),

  start: z.iso.datetime(),
  duration: z.number().nullable().optional(),
  projectId: z.string().nullable().optional(),
  notes: z.string().optional(),

  recurrence: recurrenceSchema.default({ frequency: 'weekly' }),
});
type Schema = z.output<typeof schema>;

const state = ref<Partial<Schema>>({
  name: '',
  start: '',
  duration: undefined,
  projectId: undefined,
  notes: '',
  recurrence: { frequency: 'weekly' },
});

const startDate = computed<ZonedDateTime>({
  get: () => {
    const tz = getLocalTimeZone();
    return parseAbsolute(state.value.start || new Date().toISOString(), tz).set({ millisecond: 0 });
  },
  set: value => {
    state.value.start = value.toAbsoluteString();
  },
});
const endDate = ref<ZonedDateTime | null>(null);

const recurrenceEndDate = computed<ZonedDateTime | null>({
  get: () => {
    if (!state.value.recurrence?.endDate) return null;
    const tz = getLocalTimeZone();
    return parseAbsolute(state.value.recurrence.endDate, tz);
  },
  set: value => {
    state.value.recurrence!.endDate = value ? value.toAbsoluteString() : null;
  },
});

watch(
  () => props.data,
  data => {
    if (data) {
      state.value = Object.assign({}, data);

      if (data.duration) {
        endDate.value = startDate.value
          .copy()
          .add({ milliseconds: data.duration })
          .set({ millisecond: 0 });
      } else {
        endDate.value = null;
      }
    }
  },
  { immediate: true },
);

watch([startDate, endDate], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    const start = newStart.toAbsoluteString();
    const end = newStart
      .copy()
      // take start date and set time to end time to avoid issues with end times
      .set(pick(newEnd, ['hour', 'minute', 'second']))
      .toAbsoluteString();
    // sort before calculating duration to avoid negative durations when end time is past midnight compared to start time
    const sorted = [start, end].toSorted(sortDatesAscending);
    state.value.duration = timeDiff(sorted[1]!, sorted[0]!);
  } else {
    state.value.duration = null;
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
            @click="endDate = null"
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

      <UFormField :label="$t('tasks.form.frequency')" name="recurrence.frequency">
        <USelect v-model="state.recurrence!.frequency" :items="frequencyItems" class="w-full" />
      </UFormField>

      <UFormField
        v-if="state.recurrence?.frequency === 'weekly'"
        :label="$t('tasks.form.weekdays')"
        name="recurrence.weekdays"
      >
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="day in weekdayItems"
            :key="day.value"
            :variant="state.recurrence?.weekdays?.includes(day.value) ? 'solid' : 'subtle'"
            :color="state.recurrence?.weekdays?.includes(day.value) ? 'primary' : 'neutral'"
            size="sm"
            @click="
              state.recurrence!.weekdays = state.recurrence?.weekdays?.includes(day.value)
                ? state.recurrence.weekdays.filter(d => d !== day.value)
                : [...(state.recurrence?.weekdays || []), day.value]
            "
          >
            {{ day.label }}
          </UButton>
        </div>
      </UFormField>

      <UFormField
        v-if="state.recurrence?.frequency === 'monthly'"
        :label="$t('tasks.form.dayOfMonth')"
        name="recurrence.dayOfMonth"
      >
        <UInput
          v-model.number="state.recurrence!.dayOfMonth"
          type="number"
          :min="1"
          :max="31"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="$t('tasks.form.recurrenceEnd')"
        name="recurrence.endDate"
        ref="recurrenceEndDateRef"
      >
        <UInputDate v-model="recurrenceEndDate" hide-time-zone granularity="day" class="w-full">
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-x"
              @click="recurrenceEndDate = null"
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

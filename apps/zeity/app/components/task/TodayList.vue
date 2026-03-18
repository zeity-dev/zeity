<script setup lang="ts">
import { nanoid } from 'nanoid';
import { isAfter, isBefore, set } from 'date-fns';

import {
  type Task,
  TASK_RECURRENCE_DAILY,
  TASK_RECURRENCE_ONCE,
  TASK_RECURRENCE_WEEKLY,
  TASK_RECURRENCE_MONTHLY,
} from '@zeity/types/task';
import { TIME_TYPE_MANUAL } from '@zeity/types/time';
import {
  formatDuration,
  isSameDay,
  nowWithoutMillis,
  toStartOfDay,
  sortDatesAscending,
} from '@zeity/utils/date';

const { currentOrganisation } = useOrganisation();
const { startDraft, createTime } = useTime();
const timerStore = useTimerStore();

const isSaving = ref(false);
const now = ref(nowWithoutMillis());
const queryParams = computed(() => ({
  today: true,
  assignedTo: [currentOrganisation.value?.member.id],
}));
const { data } = await useLazyFetch('/api/tasks', {
  query: queryParams,
  server: false,
});

const filteredTasks = computed(() => {
  return data.value?.items.filter(task => isTaskForToday(task)) || [];
});
const todayTasks = computed(() => {
  return filteredTasks.value.map(applyTodayStart) || [];
});
const tasks = computed(() =>
  todayTasks.value.toSorted((a, b) => sortDatesAscending(a.start, b.start)),
);

const todaysTaskTimes = timerStore.findTime(time => {
  // Only consider times that are linked to a task and started today
  const isToday = isSameDay(time.start, now.value);
  // Only consider times that belong to the current user
  const belongsToCurrentUser = time.organisationMemberId === currentOrganisation.value?.member.id;
  // Get the task for this time and check if it's in today's tasks
  if (time.taskId && isToday && belongsToCurrentUser) return true;

  return false;
});

function applyTodayStart(task: Task) {
  const taskStart = new Date(task.start);

  const today = set(new Date(), {
    hours: taskStart.getHours(),
    minutes: taskStart.getMinutes(),
    seconds: taskStart.getSeconds(),
  });

  return {
    ...task,
    start: today.toISOString(),
  };
}

function isTaskForToday(task: Task): boolean {
  if (todaysTaskTimes.value.find(t => t.taskId === task.id)) {
    // Don't show tasks that already have a started draft time
    return false;
  }

  const taskStart = new Date(task.start);
  // Task is in the future → not today
  if (isAfter(toStartOfDay(taskStart), toStartOfDay(now.value))) {
    return false;
  }

  if (task.recurrenceFrequency !== TASK_RECURRENCE_ONCE && task.recurrenceEnd) {
    const endDate = new Date(task.recurrenceEnd);
    if (isBefore(toStartOfDay(endDate), toStartOfDay(now.value))) {
      return false;
    }
  }

  switch (task.recurrenceFrequency) {
    case TASK_RECURRENCE_ONCE:
      return isSameDay(taskStart, now.value);

    case TASK_RECURRENCE_DAILY:
      return true;

    case TASK_RECURRENCE_WEEKLY:
      return task.recurrenceWeekdays?.includes(now.value.getDay()) ?? false;

    case TASK_RECURRENCE_MONTHLY:
      return task.recurrenceDayOfMonth === now.value.getDate();
  }

  return false;
}

async function handleTaskAction(task: Task) {
  isSaving.value = true;
  try {
    const baseTime = {
      type: TIME_TYPE_MANUAL,
      start: nowWithoutMillis().toISOString(),
      notes: task.notes || '',
      taskId: task.id,
      projectId: task?.projectId || null,
    };

    if (task.duration) {
      // Duration set → save directly as time
      await createTime({
        id: nanoid(),
        ...baseTime,
        duration: task.duration,
      });
    } else {
      // No duration → start as draft
      await startDraft(baseTime);
    }
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div v-if="todayTasks.length > 0" class="mb-4">
    <h3 class="text-sm font-semibold mb-2">
      {{ $t('tasks.today.title') }}
    </h3>

    <div class="flex flex-col gap-2">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800"
      >
        <div class="flex flex-col gap-1 min-w-0">
          <NuxtLink :to="`/tasks/${task.id}`" class="text-sm font-medium truncate hover:underline">
            {{ task.name }}
          </NuxtLink>

          <div class="flex items-center gap-1 flex-wrap">
            <UIcon name="i-lucide-clock" size="sm" />
            <nuxt-time
              :datetime="task.start"
              :locale="$i18n.locale"
              time-style="medium"
              relative
              class="text-sm text-muted"
            />

            <template v-if="task.duration">
              <span class="text-sm text-muted">({{ formatDuration(task.duration) }})</span>
            </template>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <UButton
            v-if="task.duration"
            size="xs"
            variant="subtle"
            icon="i-lucide-check"
            :label="$t('tasks.today.done')"
            :disabled="isSaving"
            @click="handleTaskAction(task)"
          />
          <UButton
            v-else
            size="xs"
            variant="subtle"
            icon="i-lucide-play"
            :label="$t('tasks.today.startTimer')"
            :disabled="isSaving || timerStore.isStarted"
            @click="handleTaskAction(task)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

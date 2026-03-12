<script setup lang="ts">
import { nanoid } from 'nanoid';
import { set } from 'date-fns';

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

const { loadTasks, getOrganisationTasks } = useTask();
const { currentOrganisation } = useOrganisation();
const { startDraft, createTime } = useTime();
const timerStore = useTimerStore();

const now = nowWithoutMillis();
const isLoading = ref(false);

const orgTasks = getOrganisationTasks();

const todayTasks = computed(() => {
  return orgTasks.value.filter(task => isTaskForToday(task)).map(applyTodayStart);
});
const tasks = computed(() =>
  todayTasks.value.toSorted((a, b) => sortDatesAscending(a.start, b.start)),
);

const tasksDone = timerStore.findTimes(time => {
  if (time.taskId && isSameDay(time.start, now)) return true;
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
  if (tasksDone.value.find(t => t.taskId === task.id)) {
    // Don't show tasks that already have a started draft time
    return false;
  }

  const taskStart = new Date(task.start);
  // Task is in the future → not today
  if (toStartOfDay(taskStart) > toStartOfDay(now)) return false;

  if (task.recurrence.endDate) {
    const endDate = new Date(task.recurrence.endDate);
    if (toStartOfDay(endDate) < toStartOfDay(now)) return false;
  }

  const { frequency, weekdays, dayOfMonth } = task.recurrence;

  if (frequency === TASK_RECURRENCE_ONCE) {
    return isSameDay(taskStart, now);
  }

  if (frequency === TASK_RECURRENCE_DAILY) {
    return true;
  }

  if (frequency === TASK_RECURRENCE_WEEKLY) {
    return weekdays?.includes(now.getDay()) ?? false;
  }

  if (frequency === TASK_RECURRENCE_MONTHLY) {
    return dayOfMonth === now.getDate();
  }

  return false;
}

async function loadData() {
  if (!currentOrganisation.value) return;
  isLoading.value = true;
  try {
    await loadTasks({
      assignedTo: [currentOrganisation.value.member.id],
    });
  } finally {
    isLoading.value = false;
  }
}

async function handleTaskAction(task: Task) {
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
}

onMounted(() => {
  loadData();
});

watch(currentOrganisation, () => {
  loadData();
});
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
            :icon="task.duration ? 'i-lucide-check' : 'i-lucide-play'"
            :label="task.duration ? $t('tasks.today.done') : $t('tasks.today.startTimer')"
            size="xs"
            variant="subtle"
            :disabled="!task.duration && timerStore.isStarted"
            @click="handleTaskAction(task)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

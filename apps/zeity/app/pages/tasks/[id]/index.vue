<script setup lang="ts">
import { TASK_RECURRENCE_MONTHLY, TASK_RECURRENCE_WEEKLY } from '@zeity/types/task';
import {
  ORGANISATION_MEMBER_ROLE_OWNER,
  ORGANISATION_MEMBER_ROLE_ADMIN,
} from '@zeity/types/organisation';
import { formatDuration } from '@zeity/utils/date';

definePageMeta({
  validate: async route => {
    // Check if the id is made up of digits
    return typeof route.params.id === 'string';
  },
});

const route = useRoute();
const { userHasOrganisationRole } = useOrganisation();
const { loadTask, findTaskById, removeTask } = useTask();

const taskId = route.params.id as string;
const task = findTaskById(taskId);

const isAdmin = computed(() => {
  const orgId = task?.value?.organisationId;
  if (!orgId) return false;
  return userHasOrganisationRole(orgId, [
    ORGANISATION_MEMBER_ROLE_OWNER,
    ORGANISATION_MEMBER_ROLE_ADMIN,
  ]).value;
});

onMounted(() => {
  loadTask(taskId);
});

if (!task.value) {
  loadTask(taskId);
}

async function handleDelete() {
  await removeTask(taskId);
  await navigateTo('/tasks');
}
</script>

<template>
  <div v-if="task" class="my-4">
    <UBreadcrumb :items="[{ label: $t('tasks.title'), to: '/tasks' }]" />
    <div class="mb-4 flex flex-col sm:flex-row justify-between gap-2">
      <h2
        class="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200 mb-2"
      >
        {{ task.name }}
      </h2>

      <div v-if="isAdmin" class="flex items-center gap-2 flex-wrap">
        <UButton icon="i-lucide-edit" :to="`/tasks/${taskId}/edit`">
          {{ $t('common.edit') }}
        </UButton>
        <UButton icon="i-lucide-trash" color="error" variant="outline" @click="handleDelete">
          {{ $t('common.delete') }}
        </UButton>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <UBadge variant="subtle">
          {{ $t(`tasks.recurrence.${task.recurrence.frequency}`) }}
        </UBadge>
        <span class="inline-flex items-center text-sm text-muted gap-0.5">
          <UIcon name="i-lucide-clock" size="sm" />
          <nuxt-time :datetime="task.start" time-style="medium" />
          <template v-if="task.duration"> ({{ formatDuration(task.duration) }}) </template>
        </span>
      </div>

      <div
        v-if="task.recurrence.frequency === TASK_RECURRENCE_WEEKLY"
        class="inline-flex gap-0.5 items-center"
      >
        <span class="text-sm font-medium">{{ $t('tasks.form.weekdays') }}:</span>
        <UBadge
          v-for="day in task.recurrence.weekdays"
          :key="day"
          color="neutral"
          variant="outline"
        >
          {{ $t(`tasks.weekdays.short.${day}`) }}
        </UBadge>
      </div>

      <div v-if="task.recurrence.frequency === TASK_RECURRENCE_MONTHLY">
        <span class="text-sm font-medium">{{ $t('tasks.form.dayOfMonth') }}:</span>
        <span class="text-sm text-muted ml-1">{{ task.recurrence.dayOfMonth }}</span>
      </div>

      <div v-if="task.project">
        <span class="text-sm font-medium">{{ $t('times.form.project') }}:</span>
        <UButton :to="`/projects/${task.project.id}`" :label="task.project.name" variant="link" />
      </div>

      <div v-if="task.notes">
        <span class="text-sm font-medium">{{ $t('times.form.notes') }}:</span>
        <p class="text-sm text-muted">{{ task.notes }}</p>
      </div>
    </div>

    <USeparator orientation="horizontal" class="my-4" />

    <TaskAssignmentList :task="task" :is-admin="isAdmin" />
  </div>
</template>

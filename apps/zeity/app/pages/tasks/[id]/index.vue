<script setup lang="ts">
import { TASK_RECURRENCE_MONTHLY, TASK_RECURRENCE_WEEKLY } from '@zeity/types/task';
import { formatDuration } from '@zeity/utils/date';

definePageMeta({
  validate: async route => {
    // Check if the id is made up of digits
    return typeof route.params.id === 'string';
  },
});

const route = useRoute();
const { userHasPrivilegedOrganisationRole } = useOrganisation();
const { removeTask } = useTask();

const taskId = route.params.id as string;
const { data } = await useFetch(() => `/api/tasks/${taskId}`);

const isAdmin = computed(() => {
  const orgId = data?.value?.organisationId;
  if (!orgId) return false;
  return userHasPrivilegedOrganisationRole(orgId).value;
});

async function handleDelete() {
  await removeTask(taskId);
  await navigateTo('/tasks');
}
</script>

<template>
  <div v-if="data" class="my-4">
    <UBreadcrumb :items="[{ label: $t('tasks.title'), to: '/tasks' }]" />
    <div class="mb-4 flex flex-col sm:flex-row justify-between gap-2">
      <h2
        class="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200 mb-2"
      >
        {{ data.name }}
      </h2>

      <div v-if="isAdmin" class="flex items-center gap-2 flex-wrap">
        <UButton icon="i-lucide-edit" :to="`/tasks/${encodeURIComponent(taskId)}/edit`">
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
          {{ $t(`tasks.recurrence.${data.recurrence.frequency}`) }}
        </UBadge>
        <span class="inline-flex items-center text-sm text-muted gap-0.5">
          <UIcon name="i-lucide-clock" size="sm" />
          <nuxt-time :datetime="data.start" time-style="medium" />
          <template v-if="data.duration"> ({{ formatDuration(data.duration) }}) </template>
        </span>
      </div>

      <div
        v-if="data.recurrence.frequency === TASK_RECURRENCE_WEEKLY"
        class="inline-flex gap-0.5 items-center"
      >
        <span class="text-sm font-medium">{{ $t('tasks.form.weekdays') }}:</span>
        <UBadge
          v-for="day in data.recurrence.weekdays"
          :key="day"
          color="neutral"
          variant="outline"
        >
          {{ $t(`tasks.weekdays.short.${day}`) }}
        </UBadge>
      </div>

      <div v-if="data.recurrence.frequency === TASK_RECURRENCE_MONTHLY">
        <span class="text-sm font-medium">{{ $t('tasks.form.dayOfMonth') }}:</span>
        <span class="text-sm text-muted ml-1">{{ data.recurrence.dayOfMonth }}</span>
      </div>

      <div v-if="data.project">
        <span class="text-sm font-medium">{{ $t('times.form.project') }}:</span>
        <UButton
          :to="`/projects/${encodeURIComponent(data.project.id)}`"
          :label="data.project.name"
          variant="link"
        />
      </div>

      <div v-if="data.notes">
        <span class="text-sm font-medium">{{ $t('times.form.notes') }}:</span>
        <p class="text-sm text-muted">{{ data.notes }}</p>
      </div>
    </div>

    <USeparator orientation="horizontal" class="my-4" />

    <TaskAssignmentList :task="data" :is-admin="isAdmin" />
  </div>
</template>

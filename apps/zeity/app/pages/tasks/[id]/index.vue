<script setup lang="ts">
import {
  ORGANISATION_MEMBER_ROLE_OWNER,
  ORGANISATION_MEMBER_ROLE_ADMIN,
} from '@zeity/types/organisation';

definePageMeta({
  validate: async r => {
    return typeof r.params.id === 'string';
  },
});

const route = useRoute();
const { currentOrganisation } = useOrganisation();
const { loadTask, findTaskById, removeTask } = useTask();

const taskId = route.params.id as string;
const task = findTaskById(taskId);

const orgRole = computed(() => currentOrganisation.value?.member.role);
const isAdmin = computed(
  () =>
    orgRole.value &&
    [ORGANISATION_MEMBER_ROLE_OWNER, ORGANISATION_MEMBER_ROLE_ADMIN].includes(orgRole.value),
);

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
    <h2
      class="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200 mb-2"
    >
      {{ task.name }}
    </h2>

    <div class="my-4 flex flex-col sm:flex-row justify-between gap-2">
      <div class="flex items-center gap-2">
        <UBadge variant="subtle">
          {{ $t(`tasks.recurrence.${task.recurrence.frequency}`) }}
        </UBadge>
        <span class="text-sm text-muted">
          {{ new Date(task.start).toLocaleDateString() }}
          <template v-if="task.end"> – {{ new Date(task.end).toLocaleDateString() }} </template>
        </span>
      </div>
      <div v-if="isAdmin" class="flex items-center gap-2 flex-wrap">
        <UButton icon="i-lucide-edit" :to="`/tasks/${encodeURIComponent(taskId)}/edit`">
          {{ $t('common.edit') }}
        </UButton>
        <UButton icon="i-lucide-trash" color="error" variant="outline" @click="handleDelete">
          {{ $t('common.delete') }}
        </UButton>
      </div>
    </div>

    <div v-if="task.recurrence.weekdays?.length" class="my-2">
      <span class="text-sm font-medium">{{ $t('tasks.form.weekdays') }}:</span>
      <span class="text-sm text-muted ml-1">
        {{ task.recurrence.weekdays.map(d => $t(`tasks.weekdays.short.${d}`)).join(', ') }}
      </span>
    </div>

    <div v-if="task.recurrence.dayOfMonth" class="my-2">
      <span class="text-sm font-medium">{{ $t('tasks.form.dayOfMonth') }}:</span>
      <span class="text-sm text-muted ml-1">{{ task.recurrence.dayOfMonth }}</span>
    </div>

    <div v-if="task.timeTemplate?.notes" class="my-2">
      <span class="text-sm font-medium">{{ $t('times.form.notes') }}:</span>
      <p class="text-sm text-muted">{{ task.timeTemplate.notes }}</p>
    </div>

    <USeparator orientation="horizontal" class="my-4" />

    <TaskAssignmentList :task-id="taskId" />
  </div>
</template>

<script setup lang="ts">
import type { Task } from '@zeity/types/task';

definePageMeta({
  validate: async route => {
    return typeof route.params.id === 'string';
  },
});

const route = useRoute();
const { updateTask } = useTask();
const { userHasPrivilegedOrganisationRole } = useOrganisation();

const taskId = route.params.id as string;
const { data } = await useFetch(() => `/api/tasks/${taskId}`);

const isAdmin = computed(() => {
  const orgId = data?.value?.organisationId;
  if (!orgId) return false;
  return userHasPrivilegedOrganisationRole(orgId).value;
});

watch(
  isAdmin,
  val => {
    if (val === false) navigateTo('/tasks');
  },
  { immediate: true },
);

async function save(updated: Partial<Task>) {
  await updateTask(taskId, updated);
  return navigateTo(`/tasks/${encodeURIComponent(taskId)}`);
}
</script>

<template>
  <div class="my-4">
    <UBreadcrumb :items="[{ label: $t('tasks.title'), to: '/tasks' }]" />
    <h2
      class="inline-block text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200"
    >
      {{ $t('tasks.edit.title') }}
    </h2>
    <TaskForm v-if="data" :data="data" class="mt-4" @submit="save" />
  </div>
</template>

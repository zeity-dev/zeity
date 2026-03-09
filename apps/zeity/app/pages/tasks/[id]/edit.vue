<script setup lang="ts">
import type { Task } from '@zeity/types/task';
import {
  ORGANISATION_MEMBER_ROLE_OWNER,
  ORGANISATION_MEMBER_ROLE_ADMIN,
} from '@zeity/types/organisation';

definePageMeta({
  validate: async route => {
    return typeof route.params.id === 'string';
  },
});

const route = useRoute();
const { currentOrganisation } = useOrganisation();
const { loadTask, findTaskById, updateTask } = useTask();

const orgRole = computed(() => currentOrganisation.value?.member.role);
const isAdmin = computed(
  () =>
    orgRole.value &&
    [ORGANISATION_MEMBER_ROLE_OWNER, ORGANISATION_MEMBER_ROLE_ADMIN].includes(orgRole.value),
);

watch(
  isAdmin,
  val => {
    if (val === false) navigateTo('/tasks');
  },
  { immediate: true },
);



const taskId = route.params.id as string;
const task = findTaskById(taskId);

onMounted(() => {
  loadTask(taskId);
});

async function save(data: Partial<Task>) {
  await updateTask(taskId, data);
  return navigateTo(`/tasks/${taskId}`);
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
    <TaskForm v-if="task" :data="task" class="mt-4" @submit="save" />
  </div>
</template>

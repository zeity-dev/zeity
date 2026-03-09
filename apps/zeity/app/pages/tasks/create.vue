<script setup lang="ts">
import type { NewTask } from '@zeity/types/task';
import {
  ORGANISATION_MEMBER_ROLE_OWNER,
  ORGANISATION_MEMBER_ROLE_ADMIN,
} from '@zeity/types/organisation';

const { currentOrganisation } = useOrganisation();
const { createTask } = useTask();

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

const data = ref<NewTask>({
  name: '',
  start: new Date().toISOString(),
  recurrence: { frequency: 'weekly' },
  timeTemplate: {},
});

async function handleSubmit(formData: NewTask) {
  await createTask(formData);
  return navigateTo('/tasks');
}
</script>

<template>
  <div as="section" class="page my-3">
    <UBreadcrumb :items="[{ label: $t('tasks.title'), to: '/tasks' }]" />
    <h2
      class="inline-block text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200"
    >
      {{ $t('tasks.create.title') }}
    </h2>

    <TaskForm :data="data" class="mt-4" @submit="handleSubmit" />
  </div>
</template>

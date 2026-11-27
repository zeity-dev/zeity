<script setup lang="ts">
import { ref } from 'vue';
import { nanoid } from 'nanoid';
import { navigateTo } from '#app';
import { UBreadcrumb } from '#components';
import { PROJECT_STATUS_ACTIVE, type Project } from '@zeity/types/project';
import ProjectForm from '~/components/project/Form.vue';
import { useProject } from '~/composables/project';

const { createProject } = useProject();

const data = ref<Project>({
  id: nanoid(),
  status: PROJECT_STATUS_ACTIVE,
  name: '',
  notes: '',
});

function handleSubmit(data: Project) {
  createProject(data);

  return navigateTo('/projects');
}
</script>

<template>
  <div as="section" class="page my-3">
    <UBreadcrumb :items="[{ label: $t('projects.title'), to: '/projects' }]" />
    <h2
      class="inline-block text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200"
    >
      {{ $t('projects.create.title') }}
    </h2>

    <ProjectForm :data="data" class="mt-4" @submit="handleSubmit" />
  </div>
</template>

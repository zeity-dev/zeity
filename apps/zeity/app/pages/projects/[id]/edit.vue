<script setup lang="ts">
import { onMounted } from 'vue';
import { navigateTo, useRoute } from '#app';
import { definePageMeta } from '#app/composables/pages';
import { UBreadcrumb } from '#components';
import type { Project } from '@zeity/types/project';
import ProjectForm from '~/components/project/Form.vue';
import { useProject } from '~/composables/project';
import { useProjectStore } from '~/stores/projectStore';

const route = useRoute();
const projectStore = useProjectStore();
const { loadProject, updateProject } = useProject();

definePageMeta({
  validate: async route => {
    // Check if the id is made up of digits
    return typeof route.params.id === 'string';
  },
});

const projectId = route.params.id as string;
const project = projectStore.findProjectById(projectId);

onMounted(() => {
  loadProject(projectId);
});

function save(data: Project) {
  updateProject(projectId, data);

  return navigateTo(`/projects/${projectId}`);
}
</script>

<template>
  <div class="my-4">
    <UBreadcrumb :items="[{ label: $t('projects.title'), to: '/projects' }]" />
    <h2
      class="inline-block text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200"
    >
      {{ $t('projects.edit.title') }}
    </h2>
    <ProjectForm v-if="project" :data="project" class="mt-4" @submit="save" />
  </div>
</template>

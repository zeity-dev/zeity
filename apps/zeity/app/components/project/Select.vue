<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui';
import { watchDebounced } from '@vueuse/core';
import { PROJECT_STATUS_ACTIVE } from '@zeity/types/project';

const model = defineModel<string>({ default: null });

const { getOrganisationProjects, loadProjects } = useProject();

const projects = getOrganisationProjects();
const activeProjects = computed(() =>
  projects.value.filter(project => project.status === PROJECT_STATUS_ACTIVE),
);

const items = computed(
  () =>
    activeProjects.value.map(project => ({
      value: project.id,
      label: project.name,
      description: project.notes,
    })) satisfies SelectMenuItem[],
);

const loading = ref(false);
const contentSearch = shallowRef('');

watchDebounced(
  contentSearch,
  async () => {
    loading.value = true;
    loadProjects({
      search: contentSearch.value,
      status: [PROJECT_STATUS_ACTIVE],
    }).finally(() => {
      loading.value = false;
    });
  },
  { immediate: true },
);
</script>

<template>
  <USelectMenu
    v-model:model-value="model"
    v-model:search-term="contentSearch"
    :items="items"
    :loading="loading"
    value-key="value"
    label-key="label"
    virtualize
    class="w-full"
  />
</template>

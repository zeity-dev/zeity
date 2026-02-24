<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui';
import { watchDebounced } from '@vueuse/core';
import { PROJECT_STATUS_ACTIVE } from '@zeity/types/project';

const model = defineModel<string[]>({ default: [] });

const { t } = useI18n();
const { getOrganisationProjects, loadProjects } = useProject();

const projects = getOrganisationProjects();
const activeProjects = computed(() =>
  projects.value.filter(project => project.status === PROJECT_STATUS_ACTIVE),
);

const items = computed(
  () =>
    [
      {
        value: 'all',
        label: t('projects.filter.all'),
        description: t('projects.filter.allDescription'),
        onSelect: e => {
          e.preventDefault();
          model.value = [];
        },
      },
      ...activeProjects.value.map(project => ({
        value: project.id,
        label: project.name,
        description: project.notes,
      })),
    ] satisfies SelectMenuItem[],
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
  <section class="flex flex-col gap-1">
    <span class="text-sm text-muted">
      {{ $t('projects.title') }}
    </span>
    <USelectMenu
      v-model:model-value="model"
      v-model:search-term="contentSearch"
      :items="items"
      :loading="loading"
      :placeholder="$t('common.all')"
      icon="i-lucide-list-todo"
      value-key="value"
      label-key="label"
      virtualize
      multiple
      class="w-full"
    >
      <template #item-trailing="{ item }">
        <UIcon
          v-if="item.value === 'all' && model.length < 1"
          name="i-lucide-check"
          class="size-5"
        />
      </template>
    </USelectMenu>
  </section>
</template>

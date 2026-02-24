<script setup lang="ts">
import type { OrganisationTeam } from '@zeity/database/organisation-team';

const model = defineModel<OrganisationTeam[]>({
  default: [],
});

const { t } = useI18n();
const { currentOrganisationId } = useOrganisation();

const contentSearch = shallowRef('');

const requestFilters = computed(() => {
  return {
    search: contentSearch.value ? contentSearch.value : undefined,
  };
});

const { status, data } = await useLazyFetch(
  () => `/api/organisation/${currentOrganisationId.value}/team`,
  {
    query: requestFilters,
    watch: [currentOrganisationId, contentSearch],
  },
);

type SelectItem = OrganisationTeam & { onSelect?: (e: Event) => void };
const items = computed<Partial<SelectItem>[]>(() => {
  return [
    {
      id: 'all',
      name: t('organisations.teams.filter.all'),
      description: t('organisations.teams.filter.allDescription'),
      onSelect: e => {
        e.preventDefault();
        model.value = [];
      },
    },
    ...(data.value ?? []),
  ];
});
</script>

<template>
  <section class="flex flex-col gap-1">
    <span class="text-sm text-muted">
      {{ $t('organisations.teams.title') }}
    </span>
    <USelectMenu
      v-model:model-value="model"
      v-model:search-term="contentSearch"
      :items="items"
      :loading="status === 'pending'"
      :placeholder="$t('common.all')"
      icon="i-lucide-search"
      label-key="name"
      virtualize
      multiple
      class="w-full"
    >
      <template #item-trailing="{ item }">
        <UIcon v-if="item.id === 'all' && model.length < 1" name="i-lucide-check" class="size-5" />
      </template>
    </USelectMenu>
  </section>
</template>

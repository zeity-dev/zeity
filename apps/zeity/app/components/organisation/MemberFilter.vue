<script setup lang="ts">
import type { OrganisationMemberWithUser } from '~/types/organisation';

const model = defineModel<OrganisationMemberWithUser[]>({
  default: [],
});

const props = defineProps({
  teamIds: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const teamIds = computed(() => props.teamIds || []);

const { user } = useUser();
const { currentOrganisationId } = useOrganisation();

const contentSearch = shallowRef('');

const requestFilters = computed(() => {
  return {
    team: teamIds.value.length ? teamIds.value : undefined,
    search: contentSearch.value ? contentSearch.value : undefined,
  };
});

const { status, data } = await useLazyFetch<PaginatedResponse<OrganisationMemberWithUser>>(
  () => `/api/organisation/${currentOrganisationId.value}/member`,
  {
    query: requestFilters,
    watch: [currentOrganisationId, contentSearch, teamIds],
  },
);

const sortedMembers = computed<OrganisationMemberWithUser[]>(() => {
  const members = data.value?.items || [];
  if (!members) return [];
  // Sort the current user to the top of the list
  return members.toSorted(member => (member.userId === user.value?.id ? -1 : 1));
});

type SelectItem = OrganisationMemberWithUser & { onSelect?: (e: Event) => void };
const items = computed<Partial<SelectItem>[]>(() => {
  return [
    {
      id: 'all',
      onSelect: e => {
        e.preventDefault();
        model.value = [];
      },
    },
    ...sortedMembers.value,
  ];
});
</script>

<template>
  <section class="flex flex-col gap-1">
    <span class="text-sm text-muted">
      {{ $t('organisations.members.title') }}
    </span>
    <USelectMenu
      v-model:model-value="model"
      v-model:search-term="contentSearch"
      :items="items"
      :loading="status === 'pending'"
      :placeholder="$t('common.all')"
      icon="i-lucide-users"
      label-key="user.name"
      virtualize
      multiple
      class="w-full"
    >
      <template #item-trailing="{ item }">
        <UIcon
          v-if="item['id'] === 'all' && model.length < 1"
          name="i-lucide-check"
          class="size-5"
        />
      </template>

      <template #item-label="{ item }">
        <span v-if="item?.['id'] === 'all'">
          {{ $t('organisations.members.filter.all') }}
        </span>
        <span v-else>
          {{ item?.user?.name || $t('user.deleted') }}
        </span>
      </template>

      <template #item-description="{ item }">
        <span v-if="item?.['id'] === 'all'">
          {{ $t('organisations.members.filter.allDescription') }}
        </span>
        <span v-else-if="item?.role">
          {{ $t(`organisations.members.role.${item.role}`) }}
        </span>
      </template>
    </USelectMenu>
  </section>
</template>

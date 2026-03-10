<script setup lang="ts">
import { refDebounced } from '@vueuse/core';

const model = defineModel<string[]>();
const { organisationId, excludeTeam } = defineProps({
  organisationId: {
    type: String,
    required: true,
  },
  excludeTeam: {
    type: String,
    required: false,
    default: undefined,
  },
});

const query = shallowRef('');
const queryDebounced = refDebounced(query, 300);
const queryParams = computed(() => ({
  excludeTeam,
  search: queryDebounced.value,
}));
const { data, pending, refresh } = await useLazyFetch(
  () => `/api/organisation/${organisationId}/member`,
  {
    query: queryParams,
    server: false,
    immediate: false,
  },
);

function openChange(value: boolean) {
  if (value) {
    // trigger refresh on select open
    refresh();
  }
}
</script>

<template>
  <UInputMenu
    v-model="model"
    v-model:search-term="query"
    :loading="pending"
    :items="data?.items"
    multiple
    size="xl"
    value-key="id"
    label-key="user.name"
    @update:open="openChange"
  >
    <template #item="{ item }">
      <div class="flex items-center gap-3">
        <UAvatar :src="getUserImagePath(item.user)" :alt="`${item.user?.name}`" />
        <p class="font-medium text-highlighted">
          {{ item.user?.name || $t('user.deleted') }}
        </p>
      </div>
    </template>
  </UInputMenu>
</template>

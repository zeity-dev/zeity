<script setup lang="ts">
import { refDebounced } from '@vueuse/core';

import type { Task } from '@zeity/types';

const props = defineProps<{
  task?: Task;
  existingMemberIds: string[];
}>();
const emits = defineEmits(['add']);

const open = shallowRef(false);
const query = shallowRef('');
const queryDebounced = refDebounced(query, 300);

const queryParams = computed(() => ({
  search: queryDebounced.value,
}));

const organisationId = computed(() => props.task?.organisationId);
const { data, pending, refresh } = await useLazyFetch(
  () => `/api/organisation/${organisationId.value}/member`,
  {
    query: queryParams,
    server: false,
    immediate: false,
  },
);

const availableMembers = computed(() => {
  if (!data.value?.items) return [];
  return data.value.items.filter(m => !props.existingMemberIds.includes(m.id));
});

function handleOpen(value: boolean) {
  open.value = value;
  if (value && organisationId.value) {
    refresh();
  }
}

function handleSelect(id: string) {
  emits('add', id);
  open.value = false;
}
</script>

<template>
  <UPopover :open="open" @update:open="handleOpen">
    <UButton
      :label="$t('tasks.assignments.add')"
      :disabled="!organisationId"
      icon="i-lucide-plus"
      variant="outline"
      size="xs"
    />

    <template #content>
      <div class="p-2 w-64 space-y-2">
        <UInput
          v-model="query"
          icon="i-lucide-search"
          :placeholder="$t('tasks.assignments.searchMember')"
          size="sm"
          class="w-full"
        />

        <div v-if="pending" class="text-sm text-muted p-2">...</div>
        <div v-else-if="availableMembers.length === 0" class="text-sm text-muted p-2">
          {{ $t('tasks.assignments.noMembers') }}
        </div>
        <div v-else class="max-h-48 overflow-y-auto space-y-1">
          <button
            v-for="member in availableMembers"
            :key="member.id"
            class="flex items-center gap-2 w-full p-2 rounded-md hover:bg-elevated text-left"
            @click="handleSelect(member.id)"
          >
            <UAvatar :src="getUserImagePath(member.user)" :alt="member.user?.name" size="xs" />
            <span class="text-sm truncate">{{ member.user?.name }}</span>
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>

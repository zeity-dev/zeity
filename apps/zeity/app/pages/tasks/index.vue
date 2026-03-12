<script setup lang="ts">
import type { OrganisationMemberWithUser } from '~/types/organisation';
import { formatDuration } from '@zeity/utils/date';

const { currentOrganisation, userHasPrivilegedOrganisationRole } = useOrganisation();
const isAdmin = computed(
  () => userHasPrivilegedOrganisationRole(currentOrganisation.value?.id ?? '').value,
);

// Filter state
const showMyTasks = ref(true);
const memberFilters = ref<OrganisationMemberWithUser[]>([]);

const assignedToFilter = computed<string[] | undefined>(() => {
  // Non-admins always see only their own tasks
  if (!isAdmin.value) {
    return currentOrganisation.value?.member.id ? [currentOrganisation.value.member.id] : undefined;
  }
  // Admin with member filter selected
  if (memberFilters.value.length > 0) {
    return memberFilters.value.map(m => m.id);
  }
  // Admin with "My Tasks" enabled
  if (showMyTasks.value && currentOrganisation.value?.member.id) {
    return [currentOrganisation.value.member.id];
  }
  // Admin with "All" selected (no filter)
  return undefined;
});

const pagination = ref({
  offset: 0,
  limit: 40,
});
const queryParams = computed(() => ({
  assignedTo: assignedToFilter.value,
  offset: pagination.value.offset,
  limit: pagination.value.limit,
}));
const { status, data } = await useLazyFetch('/api/tasks', {
  query: queryParams,
});
const isLoading = computed(() => status.value === 'pending');
const isEmpty = computed(() => data.value?.length === 0);
</script>

<template>
  <div class="page my-3">
    <h2
      class="inline-block text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200"
    >
      {{ $t('tasks.title') }}
    </h2>

    <section class="flex flex-col my-3 space-y-4">
      <div class="flex items-center justify-between gap-4">
        <div v-if="isAdmin" class="flex items-center gap-4">
          <USwitch v-model="showMyTasks" :label="$t('tasks.filter.myTasks')" />
        </div>
        <div v-else />
        <UButton v-if="isAdmin" to="/tasks/create" icon="i-lucide-plus">
          {{ $t('common.add') }}
        </UButton>
      </div>

      <LazyOrganisationMemberFilter v-if="isAdmin && !showMyTasks" v-model="memberFilters" />

      <UPageCard
        v-for="task in data"
        :key="task.id"
        :title="task.name"
        :ui="{
          wrapper: 'block',
          body: '',
          title: 'flex items-center justify-between gap-4',
        }"
        :to="`/tasks/${encodeURIComponent(task.id)}`"
      >
        <template #title>
          <h3 class="text-base text-pretty font-semibold text-highlighted line-clamp-3">
            {{ task.name }}
          </h3>
          <UBadge variant="subtle">
            {{ $t(`tasks.recurrence.${task.recurrence.frequency}`) }}
          </UBadge>
        </template>

        <p class="inline-flex items-center text-sm text-muted gap-0.5">
          <UIcon name="i-lucide-clock" size="sm" />
          <nuxt-time :datetime="task.start" time-style="medium" />
          <template v-if="task.duration"> ({{ formatDuration(task.duration) }}) </template>
        </p>
      </UPageCard>

      <UEmpty
        v-if="isEmpty"
        variant="subtle"
        size="lg"
        icon="i-lucide-info"
        :title="$t('tasks.empty.title')"
        :description="$t('tasks.empty.description')"
        :actions="
          isAdmin
            ? [
                {
                  label: $t('common.add'),
                  icon: 'i-lucide-plus',
                  to: '/tasks/create',
                },
              ]
            : []
        "
      />

      <UPagination
        v-if="(data?.length ?? 0) >= pagination.limit"
        :page.sync="pagination.offset"
        :page-size="pagination.limit"
        :loading="isLoading"
        @update:page="pagination.offset = $event"
      />
    </section>
  </div>
</template>

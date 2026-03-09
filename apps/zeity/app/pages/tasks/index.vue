<script setup lang="ts">
import type { OrganisationMemberWithUser } from '~/types/organisation';
import {
  ORGANISATION_MEMBER_ROLE_OWNER,
  ORGANISATION_MEMBER_ROLE_ADMIN,
} from '@zeity/types/organisation';

const { currentOrganisationId, currentOrganisation } = useOrganisation();
const { loadTasks, getOrganisationTasks } = useTask();

const tasks = getOrganisationTasks();
const isEmpty = computed(() => tasks.value.length === 0);

const orgRole = computed(() => currentOrganisation.value?.member.role);
const isAdmin = computed(
  () =>
    orgRole.value &&
    [ORGANISATION_MEMBER_ROLE_OWNER, ORGANISATION_MEMBER_ROLE_ADMIN].includes(orgRole.value),
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
const isLoading = ref(false);
const endReached = ref(true);
const hasOrg = computed(() => !!currentOrganisationId.value);

function reloadAll() {
  pagination.value.offset = 0;
  endReached.value = false;
  loadMore();
}

function loadMore() {
  if (isLoading.value) return;
  isLoading.value = true;

  loadTasks({
    ...pagination.value,
    assignedTo: assignedToFilter.value,
  })
    .then(data => {
      pagination.value.offset += data?.length || 0;
      if ((data?.length ?? 0) < pagination.value.limit) {
        endReached.value = true;
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
}

onMounted(() => {
  if (hasOrg.value) {
    loadMore();
  }
});

watch(
  currentOrganisationId,
  () => {
    reloadAll();
  },
  { immediate: true },
);

watch(showMyTasks, () => {
  reloadAll();
});

watch(memberFilters, () => {
  reloadAll();
});
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
        v-for="task in tasks"
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

        <p class="text-sm text-muted">
          <nuxt-time :datetime="task.start" :format-options="{ dateStyle: 'medium' }" />
          <template v-if="task.end">
            – <nuxt-time :datetime="task.end" :format-options="{ dateStyle: 'medium' }" />
          </template>
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

      <UButton
        v-if="hasOrg && !endReached"
        block
        class="mt-2"
        variant="subtle"
        :loading="isLoading"
        :disabled="isLoading"
        @click="loadMore"
      >
        {{ $t('common.loadMore') }}
      </UButton>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  PROJECT_STATUS_ACTIVE,
  PROJECT_STATUS_CLOSED,
  PROJECT_STATUSES,
} from '@zeity/types/project';

const showClosed = ref(false);

const projectStatusFilter = computed(() => {
  if (showClosed.value) {
    return [PROJECT_STATUS_ACTIVE, PROJECT_STATUS_CLOSED];
  }
  return [PROJECT_STATUS_ACTIVE];
});

const { loggedIn } = useUserSession();
const { currentOrganisationId } = useOrganisation();
const { loadProjects, isOnlineProject, getOrganisationProjects } = useProject();

const projects = getOrganisationProjects();
const isEmpty = computed(() => projects.value.length === 0);

const filteredProjects = computed(() => {
  return projects.value.filter(project => projectStatusFilter.value.includes(project.status));
});

const pagination = ref({
  offset: 0,
  limit: 40,
});
const isLoading = ref(false);
const hasOrg = computed(() => !!currentOrganisationId.value);
const endReached = ref(true);

function reloadAll() {
  pagination.value.offset = 0;
  endReached.value = false;
  loadMore();
}

function loadMore() {
  if (isLoading.value) return;
  isLoading.value = true;

  loadProjects({
    ...pagination.value,
    status: (showClosed.value ? PROJECT_STATUSES : [PROJECT_STATUS_ACTIVE]) as string[],
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

watch(showClosed, () => {
  reloadAll();
});

watch(
  currentOrganisationId,
  () => {
    reloadAll();
  },
  { immediate: true },
);
</script>

<template>
  <div class="page my-3">
    <h2
      class="inline-block text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200"
    >
      {{ $t('projects.title') }}
    </h2>

    <section class="flex flex-col my-3 space-y-4">
      <div class="flex items-center justify-between gap-4">
        <USwitch v-model="showClosed" :label="$t('projects.showClosed')" />

        <UButton to="/projects/create" icon="i-lucide-plus">{{ $t('common.add') }}</UButton>
      </div>

      <UPageCard
        v-for="project in filteredProjects"
        :key="project.id"
        :title="project.name"
        :ui="{
          wrapper: 'block',
          body: '',
          title: 'flex items-center justify-between gap-4',
        }"
        :to="`/projects/${encodeURIComponent(project.id)}`"
      >
        <template #title>
          <h3 class="text-base text-pretty font-semibold text-highlighted line-clamp-3">
            {{ project.name }}
          </h3>

          <div class="flex items-center gap-2">
            <UTooltip v-if="loggedIn && !isOnlineProject(project)" :text="$t('projects.offline')">
              <UIcon name="i-lucide-cloud-off" />
            </UTooltip>
            <UBadge variant="subtle" :color="getProjectStatusColor(project.status)">
              {{ $t(`projects.status.${project.status}`) }}
            </UBadge>
          </div>
        </template>

        <p v-if="project.notes" class="line-clamp-3">{{ project.notes }}</p>
        <p v-else class="text-sm text-muted">{{ $t('projects.noProjectNotes') }}</p>
      </UPageCard>

      <UEmpty
        v-if="isEmpty"
        variant="subtle"
        size="lg"
        icon="i-lucide-info"
        :title="$t('projects.empty.title')"
        :description="$t('projects.empty.description')"
        :actions="[{ label: $t('common.add'), icon: 'i-lucide-plus', to: '/projects/create' }]"
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

<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui';

const { t } = useI18n();
const { getOrganisationImagePath } = useImagePaths();
const systemStore = useSystemStore();
const { currentOrganisationId, setCurrentOrganisationId } = useOrganisation();

const { data: organisations, pending, refresh } = await useFetch('/api/organisation');
const isEmpty = computed(() => {
  if (pending.value) {
    return false;
  }
  return (organisations.value?.length ?? 0) < 1;
});

const emptyActions = computed(() => {
  const actions: ButtonProps[] = [];

  if (systemStore.allowOrganisationCreate) {
    actions.push({
      label: t('common.add'),
      icon: 'i-lucide-plus',
      to: '/organisations/create',
    });
  }

  actions.push({
    label: t('common.refresh'),
    icon: 'i-lucide-refresh-cw',
    color: 'neutral',
    onClick: () => refresh(),
  });

  return actions;
});
</script>

<template>
  <div class="page my-3">
    <section class="flex flex-col my-3 space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <h2
          class="inline-block text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200"
        >
          {{ $t('organisations.title') }}
        </h2>
        <UButton
          v-if="systemStore.allowOrganisationCreate"
          to="/organisations/create"
          icon="i-lucide-plus"
        >
          {{ $t('common.add') }}
        </UButton>
      </div>

      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-24 w-full rounded-lg" />
      </div>

      <UCard v-else v-for="organisation in organisations" :key="organisation.id">
        <template #header>
          <div class="flex items-center justify-between gap-4 flex-shrink">
            <UButton
              :to="`/organisations/${encodeURIComponent(organisation.id)}`"
              variant="link"
              size="lg"
              class="flex items-center justify-between -mx-3 truncate"
            >
              <UAvatar
                :src="getOrganisationImagePath(organisation)"
                :alt="organisation.name"
                size="lg"
                class="mr-2"
              />
              <div class="truncate">
                <span class="text-lg">
                  {{ organisation.name }}
                </span>
                <p class="text-xs text-dimmed">
                  {{ $t('organisations.members.count', organisation.stats.members ?? 0) }}
                </p>
                <p class="text-xs text-dimmed">
                  {{ $t('organisations.teams.count', organisation.stats.teams ?? 0) }}
                </p>
              </div>
            </UButton>
            <UButton
              variant="ghost"
              size="lg"
              square
              class="rounded-full"
              :color="currentOrganisationId === organisation.id ? 'primary' : 'neutral'"
              :icon="
                currentOrganisationId === organisation.id
                  ? 'i-lucide-circle-check'
                  : 'i-lucide-circle'
              "
              @click="setCurrentOrganisationId(organisation.id)"
            />
          </div>
        </template>
      </UCard>

      <UEmpty
        v-if="isEmpty && !pending"
        :title="$t('organisations.empty.title')"
        :description="$t('organisations.empty.description')"
        :actions="emptyActions"
        size="lg"
        variant="subtle"
        icon="i-lucide-info"
      />
    </section>
  </div>
</template>

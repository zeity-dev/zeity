<script setup lang="ts">
import type { OrganisationMemberWithUser } from '~/types/organisation';

const model = defineModel<OrganisationMemberWithUser[]>();

const props = defineProps({
  teamIds: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const teamIds = computed(() => props.teamIds || []);

const { user } = useUser();
const { currentOrganisationId } = useOrganisation();
const { pending, data } = await useLazyFetch(
  () => `/api/organisation/${currentOrganisationId.value}/member`,
  {
    method: 'GET',
    query: {
      team: teamIds.value,
    },
    server: false,
    watch: [currentOrganisationId, teamIds],
  },
);

const sortedMembers = computed(() => {
  const members = data.value || [];
  if (!members) return [];
  // Sort the current user to the top of the list
  return members.toSorted((member) =>
    member.userId === user.value?.id ? -1 : 1,
  );
});

const selectedIds = computed(() =>
  (model.value || []).map((member) => member.id),
);
const noSelected = computed(() => selectedIds.value.length === 0);

function toggleSelected(id: string) {
  const set = new Set(selectedIds.value);
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  model.value = sortedMembers.value.filter((member) => set.has(member.id));
}

function isSelected(id: string) {
  const ids = selectedIds.value;
  return ids.includes(id);
}
function deselectAll() {
  if (!noSelected.value) {
    model.value = [];
  }
}
</script>

<template>
  <section class="flex flex-col gap-1">
    <span class="text-sm text-muted">{{
      $t('organisations.members.title')
    }}</span>
    <div class="scrollable flex gap-2 pb-1">
      <UButton
        :label="$t('common.all')"
        :icon="noSelected ? 'i-lucide-check' : undefined"
        :color="noSelected ? 'primary' : 'neutral'"
        variant="subtle"
        class="rounded-full max-w-60"
        @click="deselectAll()"
      />
      <USkeleton v-if="pending" class="h-8 w-16 rounded-full" />
      <USkeleton v-if="pending" class="h-8 w-16 rounded-full" />
      <UButton
        v-for="value of sortedMembers"
        :key="value.id"
        :label="value.user?.name || $t('user.deleted')"
        :avatar="{ src: getUserImagePath(value.user), alt: value.user?.name }"
        :icon="isSelected(value.id) ? 'i-lucide-check' : undefined"
        :color="isSelected(value.id) ? 'primary' : 'neutral'"
        variant="subtle"
        class="rounded-full max-w-60"
        @click="toggleSelected(value.id)"
      />
    </div>
  </section>
</template>

<style scoped>
.scrollable {
  overflow: auto;
  scroll-behavior: smooth;
}
</style>

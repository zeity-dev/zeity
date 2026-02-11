<script setup lang="ts">
import type { OrganisationTeam } from '@zeity/database/organisation-team';

const model = defineModel<OrganisationTeam[]>();
const selectedIds = computed(() => (model.value || []).map(team => team.id));
const noSelected = computed(() => selectedIds.value.length === 0);

const { currentOrganisationId } = useOrganisation();
const { pending, data } = await useLazyAsyncData(
    () => $fetch<OrganisationTeam[]>(`/api/organisation/${currentOrganisationId.value}/team`),
    {
        watch: [currentOrganisationId],
    }
);
const teams = computed(() => data.value || []);

function toggleSelected(id: string) {
    const set = new Set(selectedIds.value || []);
    if (set.has(id)) {
        set.delete(id);
    } else {
        set.add(id);
    }
    model.value = teams.value.filter(team => set.has(team.id));
}

function isSelected(id: string) {
    const ids = selectedIds.value || [];
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
        <span class="text-sm text-muted">{{ $t('organisations.teams.title') }}</span>
        <div class="scrollable flex gap-2 pb-1">
            <UButton :label="$t('common.all')" :icon="noSelected ? 'i-lucide-check' : undefined"
                :color="noSelected ? 'primary' : 'neutral'" variant="subtle" class="rounded-full max-w-60"
                @click="deselectAll()" />
            <USkeleton v-if="pending" class="h-8 w-16 rounded-full" />
            <USkeleton v-if="pending" class="h-8 w-16 rounded-full" />
            <UButton v-for="team of data" :key=team.id :label="team.name"
                :icon="isSelected(team.id) ? 'i-lucide-check' : undefined"
                :color="isSelected(team.id) ? 'primary' : 'neutral'" variant="subtle" class="rounded-full max-w-60"
                @click="toggleSelected(team.id)" />
        </div>
    </section>
</template>

<style scoped>
.scrollable {
    overflow: auto;
    scroll-behavior: smooth;
}
</style>
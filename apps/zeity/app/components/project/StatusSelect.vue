<script setup lang="ts">
import type { ProjectStatus } from '@zeity/types/project';
import { PROJECT_STATUS_ACTIVE, PROJECT_STATUS_CLOSED } from '@zeity/types/project';

const { t } = useI18n();
const model = defineModel<ProjectStatus>();

const projectStatusFormItems = computed(() => [
    { value: PROJECT_STATUS_ACTIVE, label: t('projects.status.active'), chip: { color: getProjectStatusColor(PROJECT_STATUS_ACTIVE) } },
    { value: PROJECT_STATUS_CLOSED, label: t('projects.status.closed'), chip: { color: getProjectStatusColor(PROJECT_STATUS_CLOSED) } },
]);
</script>

<template>

    <USelect v-model="model" :items="projectStatusFormItems">
        <template #leading="{ modelValue, ui }">
            <UChip v-if="modelValue" inset standalone :color="getProjectStatusColor(model!)"
                :size="ui.itemLeadingChipSize() as UISize" :class="ui.itemLeadingChip()" />
        </template>
    </USelect>

</template>
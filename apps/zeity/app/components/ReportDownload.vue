<script setup lang="ts">
import { pick } from '@zeity/utils/object';

import type { Time } from '@zeity/types/time';
import type { Project } from '@zeity/types/project';
import type { OrganisationMemberWithUser } from '~/types/organisation';

const { t } = useI18n();
const projectStore = useProjectStore();

const props = defineProps({
    times: {
        type: Object as PropType<Record<string, Time[]>>,
        default: () => { },
    },
    projects: {
        type: Array as PropType<Project[]>,
        default: () => [],
    },
    members: {
        type: Array as PropType<OrganisationMemberWithUser[]>,
        default: () => [],
    },
});

const processing = ref(false);
const format = ref('xlsx');
const formatOptions = [
    { label: 'Excel', value: 'xlsx' },
    { label: 'CSV', value: 'csv' },
    { label: 'JSON', value: 'json' },
];

type EnhancedTime = Omit<Time, 'type'> & { project: string | null, user: string | null, type: string };
const exportedFields: (keyof EnhancedTime)[] = ['user', 'type', 'start', 'duration', 'project', 'notes'] as const;

async function downloadReport(type = 'json') {
    const times = props.times;
    const enhancedTimes = Object.values(times).flat().map((item) => ({
        ...item,
        type: t(`times.type.${item.type}`),
        project: getProjectName(item.projectId),
        user: getUserName(item.organisationMemberId),
    }));

    processing.value = true;
    try {
        const result = await generateReport(type, enhancedTimes);
        if (result) {
            downloadAs(URL.createObjectURL(result), `report.${type}`);
        }
    }
    catch (error) {
        console.error(error);
        useToast().add({
            color: 'error',
            title: useI18n().t('reports.downloadError'),
        });
        return;
    }
    finally {
        processing.value = false;
    }
}

function getUserName(organisationMemberId: string | undefined | null): string | null {
    if (!organisationMemberId) {
        return null;
    }

    const member = props.members.find(item => item.id === organisationMemberId);
    if (member?.user) {
        return member.user.name;
    }

    return null;
}

function getProjectName(projectId: string | undefined | null): string | null {
    if (!projectId) {
        return null;
    }

    const project = projectStore.findProjectById(projectId).value;
    if (project) {
        return project.name;
    }

    return null;
}

function generateReport(type: string, data: EnhancedTime[]) {
    switch (type) {
        case 'json':
            return generateJSONReport(data);
        case 'csv':
            return generateCSVReport(data);
        case 'xlsx':
            return generateXLSXReport(data);
    }

    return undefined;
}

function generateJSONReport(data: EnhancedTime[]) {
    const redactedData = data.map((item) => pick(item, exportedFields));
    const jsonString = JSON.stringify(redactedData, null, 2);

    return new Blob([jsonString], { type: 'text/plain' });
}

async function generateCSVReport(data: EnhancedTime[]) {
    const redactedData = data.map((item) => pick(item, exportedFields));

    const { generateCSV, toCSVBlob } = await import('@zeity/utils/csv');
    const csv = generateCSV(exportedFields, redactedData);

    return toCSVBlob(csv);
}

async function generateXLSXReport(data: EnhancedTime[]) {
    const redactedData = data.map((item) => pick(item, exportedFields));
    const labels = exportedFields.reduce((acc, field) => {
        acc[field] = t(`reports.fields.${field}`);
        return acc;
    }, {} as Record<keyof EnhancedTime, string>);

    const { generateXLSX, toXLSXBlob } = await import('@zeity/utils/xslx');
    const sheet = generateXLSX(exportedFields, redactedData, labels);

    return toXLSXBlob(sheet);
}
</script>

<template>
    <div class="text-center">
        <UFieldGroup size="lg">
            <UButton :label="$t('common.download')" :disabled="processing" :loading="processing" variant="subtle"
                color="neutral" icon="i-lucide-download" @click="downloadReport(format)" />
            <USelect v-model="format" :items="formatOptions" value-key="value" class="w-24" />
        </UFieldGroup>
    </div>
</template>
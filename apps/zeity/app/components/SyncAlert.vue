<script setup lang="ts">
import type { Project, Time } from '@zeity/types';

const loading = ref(false);

const toast = useToast();
const { t } = useI18n();
const { isOnline } = useNetworkStatus();

const { syncOfflineTimes, syncOfflineProjects } = useSync();

const { getOfflineTimes } = useTime();
const times = getOfflineTimes();
const hasOfflineTimes = computed(() => times.value.length > 0);

const { getOfflineProjects } = useProject();
const projects = getOfflineProjects();
const hasOfflineProjects = computed(() => projects.value.length > 0);

const hasOfflineData = computed(() => hasOfflineTimes.value || hasOfflineProjects.value);

async function handleSyncOfflineData() {
    if (loading.value || !isOnline.value) return;
    loading.value = true;

    const projectsToSync = projects.value;
    if (projectsToSync.length > 0) {
        await handleSyncOfflineProjects(projectsToSync);
    }

    const timesToSync = times.value;
    if (timesToSync.length > 0) {
        await handleSyncOfflineTimes(timesToSync);
    }

    loading.value = false;
}

function handleSyncOfflineProjects(projects: Project[]) {
    return syncOfflineProjects(projects.map(p => p.id))
        .then((result) => {
            toast.add({
                color: 'success',
                title: t('sync.projects.successTitle'),
                description: t('sync.projects.successMessage', result?.length || 0),
                duration: 5000,
            });
        })
        .catch((error) => {
            console.error('Error syncing offline projects:', error);
            toast.add({
                color: 'error',
                title: t('sync.projects.errorTitle'),
                description: t('sync.projects.errorMessage'),
                duration: 5000,
            });
        });
}

function handleSyncOfflineTimes(times: Time[]) {
    return syncOfflineTimes(times.map(t => t.id))
        .then((result) => {
            toast.add({
                color: 'success',
                title: t('sync.times.successTitle'),
                description: t('sync.times.successMessage', result?.length || 0),
                duration: 5000,
            });

        })
        .catch((error) => {
            console.error('Error syncing offline times:', error);
            toast.add({
                color: 'error',
                title: t('sync.times.errorTitle'),
                description: t('sync.times.errorMessage'),
                duration: 5000,
            });
        });
}

watch(isOnline, (online) => {
    if (online && hasOfflineData.value) {
        handleSyncOfflineData();
    }
});
</script>

<template>
    <UAlert v-if="hasOfflineData" :title="$t('sync.title')"
        :description="isOnline ? $t('sync.description', { timeCount: times.length, projectCount: projects.length }) : $t('sync.offlineDescription')"
        icon="i-lucide-cloud-upload" :actions="isOnline ? [
            { label: $t('sync.button'), onClick: handleSyncOfflineData, loading: loading, disabled: loading },
        ] : [
            { label: $t('sync.offlineButton'), disabled: true, icon: 'i-lucide-wifi-off' },
        ]" />
</template>
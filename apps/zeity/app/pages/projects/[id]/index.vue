<script setup lang="ts">
import { calculateDiffSum, formatDuration, sortDatesDescending } from '@zeity/utils/date';
import type { ProjectStatus } from '@zeity/types/project';

const route = useRoute()
const { loggedIn } = useUserSession();
const { currentOrganisation } = useOrganisation()
const { findProjectById } = useProject()
const { loadTimes, getOrganisationTimes } = useTime();
const { loadProject, updateProject, isOnlineProject } = useProject();
const { syncOfflineProjects } = useSync();

const timeStore = useTimerStore();

definePageMeta({
    validate: async (route) => {
        // Check if the id is made up of digits
        return typeof route.params.id === 'string'
    }
})

const projectId = route.params.id as string;

const project = findProjectById(projectId);
const orgTimes = getOrganisationTimes();
// show all times of the current user and offline times
const userTimes = computed(() => orgTimes.value.filter((item) => !item.organisationMemberId || item.organisationMemberId === currentOrganisation.value?.member.id));
const projectTimes = computed(() => userTimes.value.filter((time) => time.projectId === projectId));
const sortedProjectTimes = computed(() => projectTimes.value.toSorted((a, b) => sortDatesDescending(a.start, b.start)));
const projectTimeSum = computed(() => formatDuration(calculateDiffSum(projectTimes.value)));
const isProjectOffline = computed(() => loggedIn.value && project.value && !isOnlineProject(project.value));

onMounted(() => {
    loadProject(projectId);
    loadMoreTimes()
})

const isLoading = ref(false);
const timeOffset = ref(0);
const timeLimit = ref(40);
const timeEndReached = ref(true);

function loadMoreTimes() {
    if (isLoading.value) return;
    isLoading.value = true;

    loadTimes({ offset: timeOffset.value, limit: timeLimit.value, projectId })
        .then((data) => {
            timeOffset.value += data?.length || 0;
            timeEndReached.value = (data?.length ?? 0) < timeLimit.value;
        })
        .finally(() => {
            isLoading.value = false;
        });

}

if (!project) {
    navigateTo('/projects')
}

function updateStatus(status?: ProjectStatus) {
    if (!status) return;

    updateProject(projectId, { status: status })

    return navigateTo(`/projects/${projectId}`);
}

async function handleSync() {
    if (!project.value) return;

    const offlineProject = project.value;
    const newProjects = await syncOfflineProjects([offlineProject.id]);
    const newProject = newProjects?.[0];
    if (!newProject) return;

    // offline project are only linked to offline times therefore it is safe to update store items
    const times = timeStore.findTime((time) => time.projectId === offlineProject.id).value;
    for (const time of times) {
        timeStore.updateTime(time.id, { projectId: newProject.id });
    }

    navigateTo('/projects/' + newProject.id);
}

</script>

<template>
    <div v-if="project" class="my-4">
        <UBreadcrumb :items="[{ label: $t('projects.title'), to: '/projects' }]" />
        <h2 class="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200 mb-2">
            {{ project.name }}
        </h2>

        <div class="my-4 flex justify-between gap-2">
            <div class="flex items-center gap-2">
                <ProjectStatusSelect v-model="project.status" class="min-w-40" @update:model-value="updateStatus" />
                <UTooltip v-if="isProjectOffline" :text="$t('projects.offline')">
                    <UIcon name="i-lucide-cloud-off" class="align-middle" />
                </UTooltip>
            </div>
            <div class="flex items-center gap-2">
                <UButton v-if="isProjectOffline" icon="i-lucide-cloud-upload" @click="handleSync">
                    {{ $t('common.sync') }}
                </UButton>
                <UButton icon="i-lucide-edit" :to="`/projects/${encodeURIComponent(projectId)}/edit`">
                    {{ $t('common.edit') }}
                </UButton>
            </div>
        </div>

        <p>{{ project.notes }}</p>

        <USeparator orientation="horizontal" class="my-4" />

        <div class="my-4">
            <div class="flex justify-between">
                <h3
                    class="mb-2 inline-block text-md sm:text-lg font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200">
                    {{ $t('times.title') }}
                </h3>
                <p class="font-sans text-md tabular-nums">
                    <span class="text-sm text-[var(--ui-text-muted)]">Total:</span>
                    {{ projectTimeSum }}
                </p>
            </div>
            <div>
                <TimeList :times="sortedProjectTimes" />
                <UButton v-if="!timeEndReached" block class="mt-2" variant="subtle" :loading="isLoading"
                    :disabled="isLoading" @click="loadMoreTimes">
                    {{ $t('common.loadMore') }}
                </UButton>
            </div>
        </div>
    </div>
</template>
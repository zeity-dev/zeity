<script setup lang="ts">
import { TIME_TYPE_MANUAL } from '@zeity/types';
import { nowWithoutMillis, sortDatesDescending } from '@zeity/utils/date';

const { user } = useUser();
const timeDetail = useTimeDetail();
const timerStore = useTimerStore();
const settingsStore = useSettingsStore();
const { currentOrganisationId } = useOrganisation();
const { loadTimes, toggleDraft, getOrganisationTimes } = useTime();

const orgTimes = getOrganisationTimes();
// show all times of the current user and offline times
const userTimes = computed(() => orgTimes.value.filter((item) => !item.userId || item.userId === user.value?.id));
const sortedTimes = computed(() => userTimes.value.toSorted((a, b) => sortDatesDescending(a.start, b.start)));
const isEmpty = computed(() => userTimes.value.length < 1);

function timeNew() {
    const now = nowWithoutMillis().toISOString();
    timeDetail.open({ id: 'new', type: TIME_TYPE_MANUAL, start: now, duration: 0, notes: '' });
}

const offset = ref(0);
const limit = ref(40);
const isLoading = ref(false);
const endReached = ref(true);

function reloadAll() {
    offset.value = 0;
    endReached.value = false;
    loadMore();
}

function loadMore() {
    if (isLoading.value) return;
    isLoading.value = true;

    loadTimes({ offset: offset.value, limit: limit.value })
        .then((data) => {
            offset.value += data?.length || 0;
            if ((data?.length ?? 0) < limit.value) {
                endReached.value = true;
            }
        })
        .finally(() => {
            isLoading.value = false;
        });

}

onMounted(() => {
    reloadAll();
});

watch(toRef(currentOrganisationId), () => {
    reloadAll();
});
</script>

<template>
    <div class="flex flex-col h-full">

        <SyncAlert v-if="!!user" class="mt-4" />
        <TimeDrawer />

        <section class="grow py-3 my-3">
            <TimeList default-open :times="sortedTimes" :calculate-breaks="settingsStore.calculateBreaks" />

            <UEmpty v-if="isEmpty" variant="subtle" icon="i-lucide-info" size="lg" :title="$t('times.empty.title')"
                :description="$t('times.empty.description')" :actions="[
                    { label: timerStore.isStarted ? $t('times.empty.actions.stop') : $t('times.empty.actions.start'), icon: timerStore.isStarted ? 'i-lucide-square' : 'i-lucide-play', onClick: toggleDraft },
                    { label: $t('times.empty.actions.addTime'), icon: 'i-lucide-plus', onClick: timeNew }
                ]" />

            <UButton v-if="!endReached" block class="mt-2" variant="subtle" :loading="isLoading" :disabled="isLoading"
                @click="loadMore">
                {{ $t('common.loadMore') }}
            </UButton>
        </section>

        <footer class="sticky bottom-18 md:bottom-3">
            <TimeDraft />
        </footer>

    </div>
</template>

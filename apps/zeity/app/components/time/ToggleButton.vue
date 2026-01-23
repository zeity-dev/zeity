<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui';
// import { TIME_TYPE_BREAK } from '@zeity/types';
import { useTimerStore } from '~/stores/timerStore';

const store = useTimerStore();
const { toggleDraft, startDraft, stopDraft } = useTime();
const { isStarted, loading } = storeToRefs(store);

// const isBreakDraft = computed(() =>
//     draft.value?.type === TIME_TYPE_BREAK
// );

const startTimeButton = {
    icon: 'i-ri-play-fill',
    label: 'times.start',
    onClick: onToggle,
}
const stopTimeButton = {
    icon: 'i-ri-stop-fill',
    label: 'times.stop',
    onClick: onToggle,
}
const nextTimeButton = {
    icon: 'i-ri-skip-forward-fill',
    label: 'times.recordNext',
    onClick: onStartNext,
}
// const breakTimeButton = {
//     icon: 'i-lucide-coffee',
//     label: 'times.break.start',
//     onClick: onStartBreak,
// }
// const stopBreakButton = {
//     icon: 'i-ri-play-fill',
//     label: 'times.break.continue',
//     onClick: onStopBreak,
// }

const buttons = computed(() => {
    if (!isStarted.value) {
        return [startTimeButton];
    }

    // if (isBreakDraft.value) {
    //     return [stopTimeButton, stopBreakButton];
    // } else {
    //     return [breakTimeButton, nextTimeButton, stopTimeButton];
    // }

    return [nextTimeButton, stopTimeButton];
});
const styledButtons = computed<ButtonProps[]>(() => {
    return buttons.value.map((button, index) => {
        if (index === buttons.value.length - 1) {
            return { ...button, size: 'xl', color: 'primary' };
        } else {
            return { ...button, size: 'md', color: 'neutral' };
        }
    });
});

async function onToggle() {
    store.setLoading(true);
    await toggleDraft();
    store.setLoading(false);
}

async function onStartNext() {
    store.setLoading(true);
    await stopDraft();
    await startDraft();
    store.setLoading(false);
}

// async function onStartBreak() {
//     store.setLoading(true);
//     await stopDraft();
//     await startDraft({ type: TIME_TYPE_BREAK });
//     store.setLoading(false);
// }
// async function onStopBreak() {
//     store.setLoading(true);
//     await stopDraft();
//     await startDraft();
//     store.setLoading(false);
// }
</script>

<template>
    <div class="flex items-center gap-2">
        <UTooltip v-for="button in styledButtons" :key="button.label" :text="$t(button.label!)">
            <UButton square class="rounded-full shadow-lg" :size="button.size" :color="button.color" :disabled="loading"
                :aria-label="$t(button.label!)" :icon="button.icon" @click="button.onClick" />
        </UTooltip>
    </div>
</template>
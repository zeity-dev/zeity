<script setup lang="ts">
import { nanoid } from 'nanoid';
import { PROJECT_STATUS_ACTIVE, type Project, type Time } from '@zeity/types';
import { timeDiff, type DateLike } from '@zeity/utils/date';
import { pick } from '@zeity/utils/object';
import { downloadAs } from '~/utils/download-file';
import type { Locale } from '~/types/lang';

const { t } = useI18n();

useHead({
    title: t('settings.title'),
});

const timeStore = useTimerStore();
const projectStore = useProjectStore();

const { settings, updateSetting } = useSettings();

const localeOptions = [
    {
        label: 'English',
        value: 'en',
    },
    {
        label: 'Deutsch',
        value: 'de',
    },
];

const themeModes = computed(() => [
    {
        label: t('settings.light'),
        value: 'light',
        icon: 'i-lucide-sun'
    },
    {
        label: t('settings.dark'),
        value: 'dark',
        icon: 'i-lucide-moon'
    },
    {
        label: t('settings.auto'),
        value: 'system',
        icon: 'i-lucide-sun-moon'
    }
]);

const themePrimaryOptions = [
    {
        label: 'Sky',
        value: 'sky',
        chip: {
            ui: {
                base: 'bg-[var(--color-sky-500)]',
            }
        }
    },
    {
        label: 'Amber',
        value: 'amber',
        chip: {
            ui: {
                base: 'bg-[var(--color-amber-500)]',
            }
        }
    },
    {
        label: 'Emerald',
        value: 'emerald',
        chip: {
            ui: {
                base: 'bg-[var(--color-emerald-500)]',
            }
        }
    },
    {
        label: 'Indigo',
        value: 'indigo',
        chip: {
            ui: {
                base: 'bg-[var(--color-indigo-500)]',
            }
        }
    },
    {
        label: 'Rose',
        value: 'rose',
        chip: {
            ui: {
                base: 'bg-[var(--color-rose-500)]',
            }
        }
    }
];

const filePrompt = useTemplateRef('fileprompt');

function handleExport() {
    const content = {
        times: timeStore.getAllTimes().value,
        projects: projectStore.getAllProjects().value,
        settings: settings.value,
    };
    const blob = new Blob([JSON.stringify(content)], { type: 'text/plain' });
    const dataUri = URL.createObjectURL(blob);

    downloadAs(dataUri, `zeity-${Date.now()}.json`);
}

async function handleImport(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    const file = files?.[0];
    if (!file) return;

    const fileContent = new TextDecoder().decode(await file.arrayBuffer());
    const json = JSON.parse(fileContent);

    // TODO: Add a pretty confirmation modal
    const result = window.confirm(`Would you like to import ${json?.projects?.length ?? 0} projects and ${json?.times?.length ?? 0} times?`);

    if (!result) return;

    if (json.times && Array.isArray(json.times)) {
        timeStore.upsertTimes(
            json.times
                .map(sanitizeTime)
                .filter(Boolean)
        );
    }

    if (json.projects && Array.isArray(json.projects)) {
        projectStore.upsertProjects(
            json.projects
                .map(sanitizeProject)
                .filter(Boolean)
        );
    }
}

function sanitizeTime(data: unknown) {
    if (typeof data !== 'object' || data === null) {
        return null;
    }

    if (!('start' in data)) {
        return null;
    }

    const time: Time = pick(data as Time, ['id', 'start', 'duration', 'notes', 'projectId']);

    if (!time.id) {
        time.id = nanoid();
    }

    if ('end' in data && !('duration' in data)) {
        time.duration = timeDiff(data['end'] as DateLike, data['start'] as DateLike);
    }

    if (isNaN(time.duration)) {
        return null;
    }

    return time;
}

function sanitizeProject(data: unknown) {
    if (typeof data !== 'object' || data === null) {
        return null;
    }

    const project: Project = pick(data as Project, ['id', 'name', 'status', 'notes']);

    if (!project.id) {
        project.id = nanoid();
    }

    if (!project.name) {
        return null;
    }

    if (!project.status) {
        project.status = PROJECT_STATUS_ACTIVE;
    }

    return project;
}
</script>

<template>
    <div class="my-3 space-y-4">
        <h2
            class="inline-block text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200">
            {{ $t('settings.title') }}
        </h2>

        <FieldSet :label="$t('settings.general')">
            <label class="flex items-center justify-between">
                <span>{{ $t('settings.language') }}</span>
                <USelect v-model="settings.locale" :items="localeOptions" @update:model-value="updateSetting('locale', $event as Locale)" class="min-w-60" />
            </label>
        </FieldSet>

        <FieldSet :label="$t('settings.time.title')">
            <label class="flex items-center justify-between">
                <span>{{ $t('settings.time.detailsOnStart') }}</span>
                <USwitch v-model="settings.openTimeDetailsOnStart" @update:model-value="updateSetting('openTimeDetailsOnStart', $event)" />
            </label>

            <label class="flex items-center justify-between">
                <span>{{ $t('settings.time.detailsOnStop') }}</span>
                <USwitch v-model="settings.openTimeDetailsOnStop" @update:model-value="updateSetting('openTimeDetailsOnStop', $event)" />
            </label>

            <label class="flex items-center justify-between">
                <span>{{ $t('settings.time.calculateBreaks') }}</span>
                <USwitch v-model="settings.calculateBreaks" @update:model-value="updateSetting('calculateBreaks', $event)" />
            </label>

            <label class="flex items-center justify-between">
                <span>{{ $t('settings.time.roundTimes') }}</span>
                <USwitch v-model="settings.roundTimes" @update:model-value="updateSetting('roundTimes', $event)" />
            </label>
        </FieldSet>

        <FieldSet :label="$t('settings.appearance')">
            <label class="flex items-center justify-between">
                <span>{{ $t('settings.color') }}</span>
                <USelect v-model="settings.themeColor" :items="themePrimaryOptions" class="min-w-60" @update:model-value="updateSetting('themeColor', $event)">
                    <template #leading="{ modelValue, ui }">
                        <UChip v-if="modelValue" inset standalone :size="ui.itemLeadingChipSize() as UISize"
                            :class="ui.itemLeadingChip()" :style="`--ui-primary: var(--ui-color-${modelValue}-400);`" />
                    </template>
                </USelect>
            </label>

            <label class="flex items-center justify-between">
                <span>{{ $t('settings.theme') }}</span>

                <ClientOnly>
                    <UFieldGroup v-model="settings.themeMode" class="min-w-60">
                        <UButton v-for="mode in themeModes" :key="mode.label" :label="mode.label" :icon="mode.icon"
                            :color="settings.themeMode === mode.value ? 'primary' : 'neutral'" variant="outline"
                            block class="w-full" @click="updateSetting('themeMode', mode.value)" />
                    </UFieldGroup>
                </ClientOnly>
            </label>
        </FieldSet>

        <FieldSet :label="$t('settings.data')">

            <div class="flex gap-3">
                <input ref="fileprompt" hidden type="file" accept="application/json" @change="handleImport">
                <UButton :label="$t('settings.import')" block color="neutral" variant="subtle"
                    icon="i-lucide-hard-drive-download" @click="filePrompt?.click()" />

                <UButton :label="$t('settings.export')" block color="neutral" variant="subtle"
                    icon="i-lucide-hard-drive-upload" @click="handleExport()" />
            </div>
        </FieldSet>
    </div>
</template>
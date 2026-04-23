<script setup lang="ts">
import {
    subDays,
    endOfDay,
    startOfDay,
    getWeek,
    subWeeks,
    startOfWeek,
    subMonths,
    endOfMonth,
    startOfMonth,
    subYears,
    endOfYear,
    startOfYear,
    addDays,
} from 'date-fns';
import type { DateRange as CalendarDateRange } from 'reka-ui';
import { fromDate, getLocalTimeZone } from '@internationalized/date';
import { formatRelativeDateDiff } from '@zeity/utils/date';

import type { DateFilter, DateRange } from '~/types/date-filter';
import { DateFilterType } from '~/types/date-filter';


const { t } = useI18n();
const settings = useSettingsStore();

const selectedFilterKey = ref();
const dateFilters = computed(() => getDateFilters(settings.locale));

const model = defineModel<DateRange>();

const state = ref<DateRange>();
const calendarRange = computed({
    get: () => {
        if (!state.value) return;

        const tz = getLocalTimeZone();
        return { start: fromDate(state.value.start, tz), end: fromDate(state.value.end, tz) } as CalendarDateRange;
    },
    set: (value: CalendarDateRange) => {
        if (!value || !value.start || !value.end) return;
        const tz = getLocalTimeZone();
        setDateRange({ start: startOfDay(value.start.toDate(tz)), end: endOfDay(value.end.toDate(tz)) });
    },
});

watch(state, (state) => {
    model.value = state;
});

onMounted(() => {
    changeDateFilter(dateFilters.value[0]);
});

function changeDateFilter(event?: DateFilter) {
    if (event?.range) {
        setDateRange(event.range);
    }

    selectedFilterKey.value = event?.key || 'custom';
}

function setDateRange(value: DateRange) {
    state.value = value;
}

function getDateFilters(locale: string): DateFilter[] {
    return [
        ...getDayFilters(locale),
        ...getWeekFilters(locale, 3),
        ...getMonthFilters(locale, 4),
        ...getYearFilters(locale, 2),
        { key: 'custom', label: t('common.custom'), type: DateFilterType.Custom },
    ];
}

function getDayFilters(locale: string) {
    const today = new Date();
    const yesterday = subDays(today, 1);
    return [
        {
            key: 'today',
            text: formatRelativeDateDiff(0, locale),
            type: DateFilterType.Day,
            range: {
                start: startOfDay(today),
                end: endOfDay(today),
            }
        },
        {
            key: 'yesterday',
            text: formatRelativeDateDiff(-1, locale),
            type: DateFilterType.Day,
            range: {
                start: startOfDay(yesterday),
                end: endOfDay(yesterday),
            }
        },
    ];
}

function getWeekFilters(locale: string, count: number) {
    const now = new Date();

    const filters = [];
    for (let i = 0; i < count; i++) {
        const date = subWeeks(now, i);
        const week = getWeek(date);

        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfDay(addDays(start, 6));

        filters.push({
            key: 'kw' + week,
            text: `KW ${week}`,
            type: DateFilterType.Week,
            range: { start, end },
        });
    }

    return filters;
}

function getMonthFilters(locale: string, count: number) {
    const now = new Date();

    const filters = [];
    for (let i = 0; i < count; i++) {
        const date = subMonths(now, i);
        const month = date.getMonth();
        const monthName = date.toLocaleString(locale, { month: 'short' });

        const start = startOfMonth(date);
        const end = endOfMonth(start);

        filters.push({
            key: 'm' + month,
            // label: `Month.${month}`,
            text: monthName,
            type: DateFilterType.Month,
            range: { start, end },
        });
    }

    return filters;
}

function getYearFilters(locale: string, count: number) {
    const now = new Date();

    const filters = [];
    for (let i = 0; i < count; i++) {
        const date = subYears(now, i);
        const year = date.getFullYear();

        const start = startOfYear(date);
        const end = endOfYear(start);

        filters.push({
            key: 'y' + year,
            text: `${year}`,
            type: DateFilterType.Year,
            range: { start, end },
        });
    }

    return filters;
}

function isSelected(filter: DateFilter) {
    return filter.key === selectedFilterKey.value;
}
</script>

<template>
    <section class="flex flex-col gap-1">
        <span class="text-sm text-muted">{{ $t('times.dateFilter') }}</span>
        <div class="scrollable flex gap-2 pb-1">
            <UButton v-for="filter of dateFilters" :key=filter.key :label="filter.label || filter.text"
                :icon="isSelected(filter) ? 'i-lucide-check' : undefined"
                :color="isSelected(filter) ? 'primary' : 'neutral'" variant="subtle" class="rounded-full"
                @click="changeDateFilter(filter)" />
        </div>
        <div :class="{ hidden: selectedFilterKey !== 'custom' }" class="custom">
            <LazyUCalendar v-model="calendarRange" range />
        </div>
    </section>
</template>

<style scoped>
.scrollable {
    overflow: auto;
    scroll-behavior: smooth;
}

.custom {
    display: flex;
    margin: auto;
    overflow: hidden;
    height: 15.5rem;
    transition: opacity 0.5s, transform 0.5s, height 0.5s, display 0.5s allow-discrete;
}

.custom.hidden {
    opacity: 0;
    height: 0;
}

@starting-style {
    .custom {
        opacity: 0;
        height: 0;
    }
}
</style>
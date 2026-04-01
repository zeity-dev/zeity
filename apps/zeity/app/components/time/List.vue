<script setup lang="ts">
import { TIME_TYPE_BREAK, type Time } from '@zeity/types/time';
import type { DateLike } from '@zeity/utils/date';
import { calculateDiffSum, dayDiff, formatDate, formatDuration, formatRelativeDate, toStartOfDay } from '@zeity/utils/date';

const { times, calculateBreaks } = defineProps({
	class: { type: String, default: '' },
	times: { type: Array as PropType<Time[]>, required: true },
	defaultOpen: { type: Boolean, default: false },
	calculateBreaks: { type: Boolean, default: false },
});
const { locale } = storeToRefs(useSettingsStore());
const { calculateBreakTime } = useTime();

const groups = computed(() => {
	const all = times || [];

	const groups: Record<string, { label: string, data: Time[] }> = {};
	for (let i = 0; i < all.length; i++) {
		const item = all[i];
		if (!item) continue;

		const key = getGroupKey(item.start);
		if (!groups[key]) {
			groups[key] = { label: key, data: [] };
		}
		groups[key].data.push(item);

		if (calculateBreaks) {
			// we are iterating in reverse order. so next item is previous in time
			const prevItem = all[i + 1];
			if (!prevItem) continue;

			// calculate break time between item and prevItem
			const breakTime = calculateBreakTime(item, prevItem);
			if (!breakTime) continue;

			groups[key].data.push(breakTime);
		}
	}

	return groups;
});

function getGroupKey(date: DateLike): string {
	const today = toStartOfDay(new Date());
	const normalizedDate = toStartOfDay(date);
	const diff = dayDiff(normalizedDate, today);

	if (diff < 2) {
		return formatRelativeDate(today, normalizedDate, locale.value);
	}

	return formatDate(normalizedDate, locale.value);
}

function withoutBreaks(times: Time[]): Time[] {
	return times.filter(time => time.type !== TIME_TYPE_BREAK);
}
</script>

<template>
	<div class="flex flex-col gap-3" :class="$props.class">
		<div v-for="group in groups" :key="group.label"
			class="w-full flex flex-col overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-md">
			<TimeListItem :default-open="defaultOpen" :label="group.label"
				:description="formatDuration(calculateDiffSum(withoutBreaks(group.data)))" :times="group.data"
				class="m-1" />
		</div>
	</div>
</template>
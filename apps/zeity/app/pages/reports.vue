<script setup lang="ts">
import { isAfter, isBefore } from 'date-fns';
import {
  type Time,
  ORGANISATION_MEMBER_ROLE_ADMIN,
  ORGANISATION_MEMBER_ROLE_OWNER,
  TIME_TYPE_BREAK,
} from '@zeity/types';
import { calculateDiffSum, parseDate, toISOString } from '@zeity/utils/date';
import type { OrganisationTeam } from '@zeity/database/organisation-team';
import type { OrganisationMemberWithUser } from '~/types/organisation';
import type { DateRange } from '~/types/date-filter';

const { user } = useUser();
const { isLoggedIn } = useAuth();
const { loadTimes, getOrganisationTimes, calculateBreakTime } = useTime();
const { currentOrganisationId, currentOrganisation } = useOrganisation();
const settingsStore = useSettingsStore();

const dateFilter = ref<DateRange>();
const projectFilters = ref<string[]>([]);
const teamFilters = ref<OrganisationTeam[]>([]);
const memberFilters = ref<OrganisationMemberWithUser[]>([]);

const orgTimes = getOrganisationTimes();
const filteredTeamIds = computed(() => {
  return teamFilters.value.map(team => team.id);
});
const filteredMemberIds = computed(() => {
  // user is not set if the user is not logged in
  if (!user.value) {
    return [];
  }
  // if filters are set, return the filtered user ids
  return memberFilters.value.map(member => member.id);
});
const filteredTimes = computed(() => {
  const dFilter = dateFilter.value;
  const pFilters = projectFilters.value;
  const memberIds = filteredMemberIds.value;

  let times = orgTimes.value;

  // filter times by member ids
  if (memberIds.length) {
    times = times.filter(
      item => item.organisationMemberId && memberIds.includes(item.organisationMemberId),
    );
  }

  // filter times by date range
  if (dFilter && dFilter.start && dFilter.end) {
    times = times.filter(item => {
      const timeStart = parseDate(item.start);

      return (
        isAfter(timeStart, parseDate(dFilter.start)) && isBefore(timeStart, parseDate(dFilter.end))
      );
    });
  }

  // filter times by project ids
  if (pFilters.length) {
    times = times.filter(item => pFilters?.some(project => item.projectId?.includes(project)));
  }

  return times;
});

const groupedTimes = computed(() => {
  const groups: Record<string, Time[]> = {};
  for (const time of filteredTimes.value) {
    const memberId = time.organisationMemberId || 'unknown';
    if (!groups[memberId]) {
      groups[memberId] = [];
    }
    groups[memberId].push(time);
  }

  if (settingsStore.calculateBreaks) {
    // include breaks in each group
    for (const memberId in groups) {
      const times = groups[memberId];
      if (!times) continue;

      groups[memberId] = applyTimeBreaks(times);
    }
  }

  return groups;
});

function applyTimeBreaks(times: Time[]): Time[] {
  const result: Time[] = [];
  for (let i = 0; i < times.length; i++) {
    const item = times[i];
    if (!item) continue;

    result.push(item);

    const prevItem = times[i + 1];
    if (!prevItem) continue;

    const breakTime = calculateBreakTime(item, prevItem);
    if (breakTime) {
      result.push(breakTime);
    }
  }
  return result;
}

const workedTimes = computed(() =>
  filteredTimes.value.filter(time => time.type !== TIME_TYPE_BREAK),
);

const timeSum = computed(() => calculateDiffSum(workedTimes.value));

const orgRole = computed(() => currentOrganisation.value?.member.role);
const showAdminControls = computed(
  () =>
    orgRole.value &&
    [ORGANISATION_MEMBER_ROLE_OWNER, ORGANISATION_MEMBER_ROLE_ADMIN].includes(orgRole.value),
);

async function loadAllTimes(
  range: DateRange,
  projectIds: string[],
  memberIds: string[],
  limit = 100,
) {
  let offset = 0;
  let endReached = false;
  while (!endReached) {
    const times = await loadTimes({
      limit,
      offset,
      organisationMemberId: memberIds,
      projectId: projectIds,
      rangeStart: toISOString(range.start),
      rangeEnd: toISOString(range.end),
    });

    offset += limit;
    if ((times?.length ?? 0) < limit) {
      endReached = true;
    }
  }
}

async function reloadAll() {
  if (!isLoggedIn.value) {
    return;
  }

  if (dateFilter.value) {
    await loadAllTimes(dateFilter.value, projectFilters.value, filteredMemberIds.value);
  }
}

onMounted(async () => {
  await reloadAll();
});

watch(currentOrganisationId, async () => {
  await reloadAll();
});

watch([dateFilter, projectFilters, filteredMemberIds], async ([dateRange, projects, members]) => {
  if (dateRange && dateRange.start && dateRange.end) {
    await loadAllTimes(dateRange, projects, members);
  }
});
</script>

<template>
  <div class="my-3 space-y-6">
    <section class="flex flex-col gap-1">
      <DateFilter v-model="dateFilter" />
      <ProjectFilter v-model="projectFilters" />

      <OrganisationTeamFilter v-if="user && showAdminControls" v-model="teamFilters" />

      <OrganisationMemberFilter
        v-if="user && showAdminControls"
        v-model="memberFilters"
        :team-ids="filteredTeamIds"
      />
    </section>

    <UCard as="section">
      <template #header>
        <h2>{{ $t('reports.summary') }}</h2>
      </template>

      <TimeDurationFlowing v-model="timeSum" class="flex justify-center text-xl font-mono" />
    </UCard>

    <UCard as="section">
      <template #header>
        <h2>{{ $t('reports.report') }}</h2>
      </template>

      <ReportDownload :times="groupedTimes" :members="memberFilters" />
    </UCard>
  </div>
</template>

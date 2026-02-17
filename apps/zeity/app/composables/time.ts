import { addMilliseconds, isSameDay } from 'date-fns';
import { nanoid } from 'nanoid';

import {
  type DraftTime,
  type Time,
  TIME_TYPE_BREAK,
  TIME_TYPE_MANUAL,
} from '@zeity/types';
import {
  nowWithoutMillis,
  parseDate,
  roundToMinutes,
  roundToSeconds,
  timeDiff,
} from '@zeity/utils/date';
import { useTimerStore } from '~/stores/timerStore';
import { millisecondsInMinute } from 'date-fns/constants';

interface FetchTimesOptions {
  offset?: number;
  limit?: number;

  organisationMemberId?: string | string[];
  projectId?: string | string[];
  rangeStart?: string;
  rangeEnd?: string;
}

function fetchTimes(options?: FetchTimesOptions): Promise<Time[]> {
  return $fetch('/api/times', {
    method: 'GET',
    params: options,
  });
}

function fetchTime(id: string): Promise<Time> {
  return $fetch(`/api/times/${id}`, {
    method: 'GET',
  });
}

function postTime(data: Time): Promise<Time> {
  return $fetch('/api/times', {
    method: 'POST',
    body: data,
  });
}

function patchTime(id: string, data: Partial<Time>): Promise<Time> {
  return $fetch(`/api/times/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

function deleteTime(id: string) {
  return $fetch(`/api/times/${id}`, {
    method: 'DELETE',
  });
}

export function useTime() {
  const { t } = useI18n();
  const { loggedIn } = useUserSession();
  const { currentOrganisation } = useOrganisation();
  const { settings } = storeToRefs(useSettingsStore());

  const store = useTimerStore();

  function roundTime<T extends Partial<Time> = Time>(time: T) {
    // If the time object is incomplete, return it as is
    if (!time.start || !time.duration) return time;

    const tmpStart = parseDate(time.start);
    const tmpDuration = time.duration;
    const tmpEnd = addMilliseconds(parseDate(tmpStart), tmpDuration);

    // If the difference is less than a minute, round seconds otherwise round minutes
    const roundFn =
      tmpDuration < millisecondsInMinute ? roundToSeconds : roundToMinutes;

    const start = roundFn(tmpStart, {
      roundingMethod: 'floor',
    }).toISOString();
    const end = roundFn(tmpEnd, {
      roundingMethod: 'floor',
    }).toISOString();
    const duration = timeDiff(end, start);
    return {
      ...time,
      start,
      duration,
    };
  }

  async function loadTimes(options?: FetchTimesOptions) {
    if (!loggedIn.value) return;
    const times = await fetchTimes(options);
    store.upsertTimes(times);
    return times;
  }
  async function loadTime(id: string) {
    if (!loggedIn.value) return;
    const time = await fetchTime(id);
    store.upsertTimes([time]);
    return time;
  }

  function getOrganisationTimes() {
    const ref = store.findTimes(
      (time) =>
        !time.organisationMemberId || time.organisationMemberId === currentOrganisation.value?.member.id,
    );

    return computed(() => ref.value);
  }

  function getOfflineTimes() {
    const ref = store.findTimes((time) => !time.organisationMemberId);
    return computed(() => ref.value);
  }

  async function createTime(data: Time) {
    if (settings.value.roundTimes) {
      data = roundTime(data);
    }
    try {
      if (loggedIn.value) {
        const time = await postTime(data);
        store.insertTime(time);
        return time;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error creating time:', error);
      }
    }

    return store.insertTime(data);
  }
  async function updateTime(id: string, data: Partial<Time>) {
    if (settings.value.roundTimes) {
      if (data.start && data.duration) {
        data = roundTime(data);
      }
    }
    try {
      if (loggedIn.value && isOnlineTime(id)) {
        const time = await patchTime(id, data);
        store.updateTime(id, time);
        return time;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error creating time:', error);
      }
    }

    return store.updateTime(id, data);
  }

  async function removeTime(id: string) {
    try {
      if (loggedIn.value && isOnlineTime(id)) {
        await deleteTime(id);
        return store.removeTime(id);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error creating time:', error);
      }
    }

    return store.removeTime(id);
  }

  async function toggleDraft(): Promise<DraftTime | Time | undefined> {
    if (!toRef(store.draft).value) {
      return startDraft();
    }
    return stopDraft();
  }
  async function startDraft(time?: Partial<DraftTime>): Promise<DraftTime> {
    const newDraft = {
      type: TIME_TYPE_MANUAL,
      start: nowWithoutMillis().toISOString(),
      notes: '',
      ...time,
    };
    store.setDraft(newDraft);

    if (settings.value.openTimeDetailsOnStart) {
      await navigateTo('/time/draft');
    }

    return newDraft;
  }
  async function stopDraft() {
    const draftValue = toRef(store.draft).value;
    if (!draftValue) return;

    const start = draftValue.start;
    const end = nowWithoutMillis();
    const duration = timeDiff(end, start);

    const temp = {
      id: nanoid(),
      ...draftValue,
      duration,
    };

    const time = await createTime(temp);
    store.resetDraft();

    if (settings.value.openTimeDetailsOnStop && time) {
      await navigateTo(`/time/${time.id}`);
    }

    return time;
  }

  function isOnlineTime(idOrTime: string | Time) {
    const time =
      typeof idOrTime === 'object'
        ? idOrTime
        : store.findTimeById(idOrTime).value;
    return !!time?.organisationMemberId;
  }

  function calculateBreakTime(nextItem: Time, previousItem: Time): Time | null {
    const prevEnd = addMilliseconds(
      parseDate(previousItem.start),
      previousItem.duration,
    );

    // if on different days, no break
    if (!isSameDay(prevEnd, parseDate(nextItem.start))) {
      return null;
    }

    // if previous item's end is not on the same day as its start, no break
    if (!isSameDay(prevEnd, parseDate(previousItem.start))) {
      return null;
    }

    const duration = timeDiff(nextItem.start, prevEnd);

    if (duration <= 0) {
      return null;
    }

    return {
      id: `break-${previousItem.id}`,
      type: TIME_TYPE_BREAK,
      start: prevEnd.toISOString(),
      duration: duration,
      notes: t('times.break.notes'),
      organisationMemberId: previousItem.organisationMemberId,
    } satisfies Time;
  }

  return {
    loadTimes,
    loadTime,

    getOrganisationTimes,
    getOfflineTimes,

    createTime,
    updateTime,
    removeTime,

    isOnlineTime,

    toggleDraft,
    startDraft,
    stopDraft,
    roundTime,

    calculateBreakTime,
  };
}

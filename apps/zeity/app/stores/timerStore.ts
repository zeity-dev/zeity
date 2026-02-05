import { defineStore } from 'pinia';

import { useEntityStore } from './entityStore';
import type { DraftTime, Time } from '@zeity/types/time';
import { useLocalStorage } from '~/utils/localstorage';

export const useTimerStore = defineStore('timer', () => {
  const loading = ref(false);
  function setLoading(value: boolean) {
    loading.value = value;
  }

  // Times
  const timesStore = useEntityStore<Time>('times');

  // Draft
  const draft = ref<DraftTime | null>(null);
  const isStarted = computed(() => !!draft.value);
  function setDraft(data: DraftTime) {
    draft.value = data;
    return draft;
  }
  function updateDraft(data: Partial<DraftTime>) {
    if (!draft.value) {
      if (import.meta.env.DEV) {
        console.warn('Draft is not started');
      }
      return draft.value;
    }

    draft.value = {
      ...draft.value,
      ...data,
    };

    return draft;
  }
  function resetDraft() {
    draft.value = null;
  }

  function upsertTimes(times: Time[]) {
    return timesStore.upsertMany(times);
  }

  function insertTime(time: Time) {
    return timesStore.insert(time);
  }

  function updateTime(id: string, time: Partial<Time>) {
    return timesStore.update(id, time);
  }

  function loadTimesFromLocalStorage() {
    const times = useLocalStorage().getItem<Time[]>('times');
    if (!times) return;

    timesStore.upsertMany(times);
  }

  function loadDraftFromLocalStorage() {
    const value = useLocalStorage().getItem<DraftTime>('draft');
    if (!value) return;

    setDraft(value);
  }

  function loadFromLocalStorage() {
    loadTimesFromLocalStorage();
    loadDraftFromLocalStorage();
  }

  onMounted(() => {
    loadFromLocalStorage();
  });

  const offlineTimes = computed(() => {
    const times = timesStore.getAll();
    return times.value.filter((time) => !time.userId);
  });

  watch(draft, (value) => {
    useLocalStorage().setItem('draft', value);
  });
  watch(offlineTimes, (value) => {
    useLocalStorage().setItem('times', value);
  });

  return {
    offlineTimes,
    getAllTimes: timesStore.getAll,
    findTimes: timesStore.find,
    findTimeById: timesStore.findById,
    findTime: timesStore.find,

    upsertTimes,
    insertTime,
    updateTime,
    removeTime: timesStore.remove,

    draft,
    isStarted,
    updateDraft,
    setDraft,
    resetDraft,

    loading,
    setLoading,

    loadFromLocalStorage,
  };
});

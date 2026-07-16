import type { TimerReminderSyncMessage } from '~~/shared/types/timerReminder';

export function useTimerReminder() {
  const store = useTimerStore();
  const settingsStore = useSettingsStore();

  const { draft, isStarted } = storeToRefs(store);

  function syncWithServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    const controller = navigator.serviceWorker.controller;
    if (!controller) return;

    const message: TimerReminderSyncMessage = {
      type: 'TIMER_REMINDER_SYNC',
      draftStart: isStarted.value ? (draft.value?.start ?? null) : null,
      timerReminderEnabled: settingsStore.timerReminderEnabled,
      timerReminderThreshold: settingsStore.timerReminderThreshold,
    };

    controller.postMessage(message);
  }

  // Sync on mount so a timer that was already running is picked up immediately.
  onMounted(() => {
    syncWithServiceWorker();
  });

  // Re-sync whenever the timer start/stop state or any relevant setting changes.
  watch(
    [
      isStarted,
      () => draft.value?.start,
      () => settingsStore.timerReminderEnabled,
      () => settingsStore.timerReminderThreshold,
    ],
    () => {
      syncWithServiceWorker();
    },
  );
}

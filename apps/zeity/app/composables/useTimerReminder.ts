import { useIntervalFn } from '@vueuse/core';

export function useTimerReminder() {
  const { t } = useI18n();
  const store = useTimerStore();
  const settingsStore = useSettingsStore();

  const { draft, isStarted } = storeToRefs(store);

  // Track the start time of the draft for which a notification was already sent.
  // This prevents sending repeated notifications for the same running timer.
  const notifiedForStart = ref<string | null>(null);

  function sendNotification() {
    if (!('Notification' in window)) return;

    if (Notification.permission !== 'granted') return;

    new Notification(t('timer.reminder.title'), {
      body: t('timer.reminder.body'),
      icon: '/favicon.svg',
      tag: 'timer-reminder',
    });
  }

  function checkAndNotify() {
    if (!settingsStore.timerReminderEnabled) return;
    if (!isStarted.value || !draft.value?.start) return;

    const thresholdMs = settingsStore.timerReminderThreshold * 60 * 60 * 1000;
    const elapsed = Date.now() - new Date(draft.value.start).getTime();

    if (elapsed < thresholdMs) return;

    // Only notify once per timer start
    if (notifiedForStart.value === draft.value.start) return;

    notifiedForStart.value = draft.value.start;
    sendNotification();
  }

  // Reset notification tracking whenever the timer is stopped
  watch(isStarted, (value) => {
    if (!value) {
      notifiedForStart.value = null;
    }
  });

  // Check every minute; immediateCallback is false (default) so the first
  // check is delayed by one interval, giving a grace period on page load.
  useIntervalFn(checkAndNotify, 60 * 1000, { immediateCallback: false });
}

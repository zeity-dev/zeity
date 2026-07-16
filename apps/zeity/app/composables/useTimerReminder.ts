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

    if (elapsed < thresholdMs) {
      // Timer is within threshold — reset so a notification fires again
      // if the threshold is later exceeded after a restart.
      notifiedForStart.value = null;
      return;
    }

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

  // Check every minute
  useIntervalFn(checkAndNotify, 60 * 1000);
}

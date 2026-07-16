export interface TimerReminderSyncMessage {
  type: 'TIMER_REMINDER_SYNC';
  draftStart: string | null;
  timerReminderEnabled: boolean;
  timerReminderThreshold: number;
  notificationTitle: string;
  notificationBody: string;
}

export function isTimerReminderSyncMessage(value: unknown): value is TimerReminderSyncMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as TimerReminderSyncMessage).type === 'TIMER_REMINDER_SYNC'
  );
}

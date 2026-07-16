export interface TimerReminderSyncMessage {
  type: 'TIMER_REMINDER_SYNC';
  draftStart: string | null;
  timerReminderEnabled: boolean;
  timerReminderThreshold: number;
  notificationTitle: string;
  notificationBody: string;
}

export function isTimerReminderSyncMessage(value: unknown): value is TimerReminderSyncMessage {
  if (typeof value !== 'object' || value === null) return false;
  const msg = value as Record<string, unknown>;
  return (
    msg['type'] === 'TIMER_REMINDER_SYNC' &&
    (msg['draftStart'] === null || typeof msg['draftStart'] === 'string') &&
    typeof msg['timerReminderEnabled'] === 'boolean' &&
    typeof msg['timerReminderThreshold'] === 'number' &&
    typeof msg['notificationTitle'] === 'string' &&
    typeof msg['notificationBody'] === 'string'
  );
}

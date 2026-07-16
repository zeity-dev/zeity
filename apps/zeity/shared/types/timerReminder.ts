export interface TimerReminderSyncMessage {
  type: 'TIMER_REMINDER_SYNC';
  draftStart: string | null;
  timerReminderEnabled: boolean;
  timerReminderThreshold: number;
}

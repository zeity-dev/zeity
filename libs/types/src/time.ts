export const TIME_TYPE_MANUAL = 'manual' as const;
export const TIME_TYPE_BREAK = 'break' as const;

export const TIME_TYPES = [TIME_TYPE_MANUAL, TIME_TYPE_BREAK];
export type TimeType = (typeof TIME_TYPES)[number];

export interface Time {
  id: string;
  type: TimeType;

  start: string;
  duration: number;

  notes: string;

  projectId?: string | null;

  organisationId?: string | null;
  organisationMemberId?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export type DraftTime = Omit<Time, 'id' | 'duration'>;

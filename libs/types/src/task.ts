import { User } from './user';
import { Project } from './project';

export const TASK_RECURRENCE_ONCE = 'once' as const;
export const TASK_RECURRENCE_DAILY = 'daily' as const;
export const TASK_RECURRENCE_WEEKLY = 'weekly' as const;
export const TASK_RECURRENCE_MONTHLY = 'monthly' as const;

export const TASK_RECURRENCE_FREQUENCIES = [
  TASK_RECURRENCE_ONCE,
  TASK_RECURRENCE_DAILY,
  TASK_RECURRENCE_WEEKLY,
  TASK_RECURRENCE_MONTHLY,
] as const;

export type TaskRecurrenceFrequency = (typeof TASK_RECURRENCE_FREQUENCIES)[number];

export interface TaskRecurrence {
  frequency: TaskRecurrenceFrequency;
  /** 0-6 (0 = Sunday, 1 = Monday, ..., 6 = Saturday) */
  weekdays?: number[];
  dayOfMonth?: number;
  endDate?: string | null;
}

export interface Task {
  id: string;
  name: string;

  start: string;
  duration?: number | null;
  projectId?: string | null;
  project?: Project;
  notes?: string;

  recurrence: TaskRecurrence;

  organisationId?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export interface TaskAssignment {
  taskId: string;
  organisationMemberId: string;
  createdAt?: string;

  user?: Partial<User>;
}

export type NewTaskAssignment = Omit<TaskAssignment, 'createdAt'>;

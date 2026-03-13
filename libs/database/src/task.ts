import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { type TaskRecurrenceFrequency, TASK_RECURRENCE_ONCE } from '@zeity/types/task';
import { timestampColumns } from './common';
import { projects } from './project';
import { organisations } from './organisation';

export const tasks = pgTable(
  'task',
  {
    id: uuid('id').defaultRandom().notNull().primaryKey(),

    name: varchar('name', { length: 200 }).notNull(),

    start: timestamp('start', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    duration: integer('duration'),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    notes: text('notes').notNull().default(''),

    recurrenceFrequency: varchar('recurrence_frequency', { length: 40 })
      .notNull()
      .default(TASK_RECURRENCE_ONCE)
      .$type<TaskRecurrenceFrequency>(),
    recurrenceWeekdays: jsonb('recurrence_weekdays').notNull().default([]).$type<number[]>(),
    recurrenceDayOfMonth: integer('recurrence_day_of_month'),
    recurrenceEnd: date('recurrence_end', {
      mode: 'date',
    }),

    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),

    ...timestampColumns(),
  },
  table => [
    index().on(table.organisationId, table.createdAt),
    index().on(table.organisationId, table.recurrenceFrequency, table.start),
    index().on(table.organisationId, table.recurrenceFrequency, table.recurrenceEnd),
    index().on(table.organisationId, table.recurrenceFrequency, table.recurrenceDayOfMonth, table.recurrenceEnd),
  ],
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

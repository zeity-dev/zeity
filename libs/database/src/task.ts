import { index, jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { timestampColumns } from './common';
import { organisations } from './organisation';
import type { TaskRecurrence, TaskTimeTemplate } from '@zeity/types';

export const tasks = pgTable(
  'task',
  {
    id: uuid('id').defaultRandom().notNull().primaryKey(),

    name: varchar('name', { length: 200 }).notNull(),

    start: timestamp('start', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    end: timestamp('end', {
      withTimezone: true,
      mode: 'date',
    }),

    recurrence: jsonb('recurrence').notNull().$type<TaskRecurrence>(),

    timeTemplate: jsonb('time_template').notNull().default({}).$type<TaskTimeTemplate>(),

    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),

    ...timestampColumns(),
  },
  table => [index().on(table.organisationId), index().on(table.start)],
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

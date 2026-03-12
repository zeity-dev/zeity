import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { timestampColumns } from './common';
import { projects } from './project';
import { organisations } from './organisation';
import type { TaskRecurrence } from '@zeity/types';

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

    recurrence: jsonb('recurrence').notNull().$type<TaskRecurrence>(),

    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),

    ...timestampColumns(),
  },
  table => [index().on(table.organisationId), index().on(table.start)],
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

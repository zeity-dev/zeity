import { index, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { type ProjectStatus, PROJECT_STATUS_ACTIVE } from '@zeity/types';
import { timestampColumns } from './common';
import { organisations } from './organisation';
import { users } from './user';

export const projects = pgTable(
  'project',
  {
    id: uuid('id').defaultRandom().notNull().primaryKey(),

    name: varchar('name', { length: 150 }).notNull(),
    status: text('status')
      .notNull()
      .default(PROJECT_STATUS_ACTIVE)
      .$type<ProjectStatus>(),
    notes: text('notes').notNull().default(''),

    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    ...timestampColumns(),
  },
  (table) => [index().on(table.name), index().on(table.status)],
);

export type Project = typeof projects.$inferSelect; // return type when queried
export type NewProject = typeof projects.$inferInsert; // insert type

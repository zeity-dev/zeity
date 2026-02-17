import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { timestampColumns } from './common';
import { projects } from './project';
import { organisationMembers } from './organisation-member';
import { type TimeType, TIME_TYPE_MANUAL } from '@zeity/types';

export const times = pgTable(
  'time',
  {
    id: uuid('id').defaultRandom().notNull().primaryKey(),

    type: varchar('type', { length: 100 })
      .notNull()
      .default(TIME_TYPE_MANUAL)
      .$type<TimeType>(),

    start: timestamp('start', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    duration: integer('duration').notNull(),
    notes: text('notes').notNull().default(''),

    projectId: uuid('project_id').references(() => projects.id, {
      onDelete: 'cascade',
    }),

    organisationMemberId: uuid('organisation_member_id').references(
      () => organisationMembers.id,
      { onDelete: 'cascade' },
    ),

    ...timestampColumns(),
  },
  (table) => [index().on(table.start), index().on(table.duration)],
);

export type Time = typeof times.$inferSelect; // return type when queried
export type NewTime = typeof times.$inferInsert; // insert type

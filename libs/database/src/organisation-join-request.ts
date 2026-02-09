import { pgTable, uuid, text, varchar, index } from 'drizzle-orm/pg-core';

import { timestampColumns } from './common';
import { organisations } from './organisation';
import { users } from './user';
import { JOIN_REQUEST_STATUS_PENDING, JoinRequestStatus } from '@zeity/types';

export const organisationJoinRequests = pgTable(
  'organisation_join_request',
  {
    id: uuid('id').defaultRandom().notNull().primaryKey(),
    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    status: varchar('status', { length: 50 })
      .notNull()
      .default(JOIN_REQUEST_STATUS_PENDING)
      .$type<JoinRequestStatus>(),

    message: text('message').notNull().default(''),

    ...timestampColumns(),
  },
  (table) => [index().on(table.status)],
);

export type OrganisationJoinRequest =
  typeof organisationJoinRequests.$inferSelect;
export type NewOrganisationJoinRequest =
  typeof organisationJoinRequests.$inferInsert;

import { pgTable, unique, uuid, varchar } from 'drizzle-orm/pg-core';

import type { OrganisationMemberRole } from '@zeity/types/organisation';
import { timestampColumns } from './common';
import { organisations } from './organisation';
import { users } from './user';

export const organisationMembers = pgTable(
  'organisation_member',
  {
    id: uuid('id').defaultRandom().notNull().primaryKey(),
    role: varchar('role', { length: 10 })
      .notNull()
      .$type<OrganisationMemberRole>(),

    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),

    ...timestampColumns(),
  },
  (table) => [unique().on(table.userId, table.organisationId)],
);

export type OrganisationMember = typeof organisationMembers.$inferSelect; // return type when queried
export type NewOrganisationMember = typeof organisationMembers.$inferInsert; // insert type

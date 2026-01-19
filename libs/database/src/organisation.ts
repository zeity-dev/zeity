import {
  index,
  pgTable,
  text,
  uuid,
  varchar,
  jsonb,
} from 'drizzle-orm/pg-core';
import { timestampColumns } from './common';

interface OrganisationQuota {
  users?: number;
  [key: string]: number | undefined;
}

export const organisations = pgTable(
  'organisation',
  {
    id: uuid('id').defaultRandom().notNull().primaryKey(),
    name: varchar('name', { length: 150 }).notNull(),
    image: text('image'),

    quota: jsonb('quota').default({}).notNull().$type<OrganisationQuota>(),

    ...timestampColumns(),
  },
  (table) => [index().on(table.name)],
);

export type Organisation = typeof organisations.$inferSelect; // return type when queried
export type NewOrganisation = typeof organisations.$inferInsert; // insert type

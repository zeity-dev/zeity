import { pgTable, text, unique, uuid } from 'drizzle-orm/pg-core';

import { timestampColumns } from './common';
import { users } from './user';

export const userAccounts = pgTable(
  'user_account',
  {
    id: uuid('id').defaultRandom().notNull().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    scope: text('scope'),

    password: text('password'),

    ...timestampColumns(),
  },
  (table) => [unique().on(table.accountId, table.providerId)]
);

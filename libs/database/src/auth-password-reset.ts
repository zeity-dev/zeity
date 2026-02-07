import {
  index,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

import { timestampColumns } from './common';
import { users } from './user';

export const authPasswordReset = pgTable(
  'auth_password_reset',
  {
    id: serial('id').primaryKey(),
    code: text('code').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    createdAt: timestampColumns().createdAt,
  },
  (table) => [index().on(table.expiresAt), unique().on(table.code)],
);

export type AuthPasswordReset = typeof authPasswordReset.$inferSelect;
export type NewAuthPasswordReset = typeof authPasswordReset.$inferInsert;

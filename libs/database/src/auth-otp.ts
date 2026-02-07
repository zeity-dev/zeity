import {
  index,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

import { timestampColumns } from './common';
import { users } from './user';

export const authOTP = pgTable(
  'auth_otp',
  {
    id: serial('id').primaryKey(),
    type: varchar('type', { length: 100 }).notNull(),
    code: text('code').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    createdAt: timestampColumns().createdAt,
  },
  (table) => [
    index().on(table.expiresAt),
    index().on(table.code),
    index().on(table.type),
    unique().on(table.code, table.type),
  ],
);

export type AuthOTP = typeof authOTP.$inferSelect;
export type NewAuthOTP = typeof authOTP.$inferInsert;

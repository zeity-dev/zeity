import { pgTable, uuid, uniqueIndex, varchar, boolean } from 'drizzle-orm/pg-core';
import { timestampColumns } from './common';
import { organisations } from './organisation';
import { users } from './user';

export const userSettings = pgTable(
  'user_settings',
  {
    id: uuid('id').defaultRandom().notNull().primaryKey(),

    locale: varchar('locale').notNull().default('en'),

    openTimeDetailsOnStart: boolean('open_time_details_on_start').notNull().default(false),
    openTimeDetailsOnStop: boolean('open_time_details_on_stop').notNull().default(false),
    calculateBreaks: boolean('calculate_breaks').notNull().default(false),
    roundTimes: boolean('round_times').notNull().default(false),

    themeColor: varchar('theme_color').notNull().default('sky'),
    themeMode: varchar('theme_mode').notNull().default('system'),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),

    ...timestampColumns(),
  },
  table => [uniqueIndex().on(table.userId, table.organisationId)],
);

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;

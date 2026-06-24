import { index, jsonb, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { timestampColumns } from './common';
import { organisations } from './organisation';
import { organisationMembers } from './organisation-member';
import { type AuditAction, type AuditEntityType } from '@zeity/types';

export const auditLogs = pgTable(
  'audit_log',
  {
    id: uuid('id').defaultRandom().notNull().primaryKey(),

    entityType: varchar('entity_type', { length: 100 }).notNull().$type<AuditEntityType>(),
    action: varchar('action', { length: 40 }).notNull().$type<AuditAction>(),
    entityId: uuid('entity_id').notNull(),

    oldValues: jsonb('old_values').$type<Record<string, unknown> | null>(),
    newValues: jsonb('new_values').$type<Record<string, unknown> | null>(),

    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    organisationMemberId: uuid('organisation_member_id').references(() => organisationMembers.id, {
      onDelete: 'set null',
    }),

    createdAt: timestampColumns().createdAt,
  },
  table => [
    index().on(table.entityId, table.createdAt),
    index().on(table.organisationId, table.entityType, table.createdAt),
    index().on(table.organisationMemberId, table.createdAt),
  ],
);

export type AuditLogRecord = typeof auditLogs.$inferSelect;
export type NewAuditLogRecord = typeof auditLogs.$inferInsert;

import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { timestampColumns } from './common';
import { tasks } from './task';
import { organisationMembers } from './organisation-member';

export const taskAssignments = pgTable(
  'task_assignment',
  {
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    organisationMemberId: uuid('organisation_member_id')
      .notNull()
      .references(() => organisationMembers.id, { onDelete: 'cascade' }),

    createdAt: timestampColumns().createdAt,
  },
  table => [primaryKey({ columns: [table.taskId, table.organisationMemberId] })],
);

export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type NewTaskAssignment = typeof taskAssignments.$inferInsert;

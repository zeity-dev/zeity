import { z } from 'zod';

import { eq, desc, ilike, inArray } from '@zeity/database';
import { tasks } from '@zeity/database/task';
import { taskAssignments } from '@zeity/database/task-assignment';
import { coerceArray } from '~~/server/utils/zod';
import { isPrivilegedOrganisationMember } from '~~/server/utils/organisation-permission';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const query = await getValidatedQuery(
    event,
    z.object({
      offset: z.coerce.number().int().nonnegative().default(0),
      limit: z.coerce.number().int().positive().lte(500).default(40),
      search: z.string().optional(),
      assignedTo: coerceArray(z.uuid()).optional(),
    }).safeParse,
  );

  if (!query.success) {
    throw createError({
      data: query.error,
      statusCode: 400,
      message: 'Invalid request queries',
    });
  }

  const whereStatements = [eq(tasks.organisationId, organisation.value)];

  if (query.data.search) {
    whereStatements.push(ilike(tasks.name, `%${query.data.search}%`));
  }

  // Get the current user's membership
  const organisationMember = await getOrganisationMemberByUserId(
    organisation.value,
    session.user.id,
  );

  if (!organisationMember) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const isPrivileged = isPrivilegedOrganisationMember(organisationMember);

  // Determine which member IDs to filter by
  let filterMemberIds: string[] | undefined;

  if (query.data.assignedTo) {
    if (!isPrivileged) {
      // Non-privileged users can only filter their own assignments
      if (!query.data.assignedTo.every(id => id === organisationMember.id)) {
        throw createError({
          statusCode: 403,
          message: 'Forbidden',
        });
      }
    }
    filterMemberIds = query.data.assignedTo;
  } else if (!isPrivileged) {
    // Non-privileged users default to seeing only their assigned tasks
    filterMemberIds = [organisationMember.id];
  }

  if (filterMemberIds) {
    // Get task IDs assigned to the specified members
    const assignedTaskIds = await useDrizzle()
      .select({ taskId: taskAssignments.taskId })
      .from(taskAssignments)
      .where(inArray(taskAssignments.organisationMemberId, filterMemberIds))
      .then(rows => Array.from(new Set(rows.map(r => r.taskId))));

    if (assignedTaskIds.length === 0) {
      return [];
    }

    whereStatements.push(inArray(tasks.id, assignedTaskIds));
  }

  const result = await useDrizzle()
    .select()
    .from(tasks)
    .where(and(...whereStatements))
    .orderBy(desc(tasks.createdAt))
    .limit(query.data.limit)
    .offset(query.data.offset);

  return result;
});

import { z } from 'zod';
import { endOfDay, startOfDay } from 'date-fns';

import {
  type SQL,
  and,
  or,
  eq,
  ilike,
  isNull,
  inArray,
  arrayContains,
  between,
  gt,
  desc,
} from '@zeity/database';
import { tasks } from '@zeity/database/task';
import { taskAssignments } from '@zeity/database/task-assignment';
import {
  TASK_RECURRENCE_DAILY,
  TASK_RECURRENCE_MONTHLY,
  TASK_RECURRENCE_ONCE,
  TASK_RECURRENCE_WEEKLY,
} from '@zeity/types/task';
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
      today: z.coerce.boolean().default(false),
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

  const whereStatements: (SQL | undefined)[] = [eq(tasks.organisationId, organisation.value)];

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
  let filterMemberIds: string[] = [];

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
    // If no specific filter is provided, non-privileged users can only see their own assignments
    filterMemberIds = [organisationMember.id];
  }

  if (filterMemberIds.length > 0) {
    whereStatements.push(inArray(taskAssignments.organisationMemberId, filterMemberIds));
  }

  if (query.data.today) {
    const startOfToday = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());

    whereStatements.push(
      or(
        // One-time tasks that start today
        and(
          eq(tasks.recurrenceFrequency, TASK_RECURRENCE_ONCE),
          between(tasks.start, startOfToday, endOfToday),
        ),
        // Daily recurring tasks that haven't ended yet
        and(
          eq(tasks.recurrenceFrequency, TASK_RECURRENCE_DAILY),
          or(isNull(tasks.recurrenceEnd), gt(tasks.recurrenceEnd, startOfToday)),
        ),
        // Weekly recurring tasks that occur on the current weekday and haven't ended yet
        and(
          eq(tasks.recurrenceFrequency, TASK_RECURRENCE_WEEKLY),
          arrayContains(tasks.recurrenceWeekdays, [startOfToday.getDay()]),
          or(isNull(tasks.recurrenceEnd), gt(tasks.recurrenceEnd, startOfToday)),
        ),
        // Monthly recurring tasks that occur on the current day of the month and haven't ended yet
        and(
          eq(tasks.recurrenceFrequency, TASK_RECURRENCE_MONTHLY),
          eq(tasks.recurrenceDayOfMonth, startOfToday.getDate()),
          or(isNull(tasks.recurrenceEnd), gt(tasks.recurrenceEnd, startOfToday)),
        ),
      ),
    );
  }

  const result = await useDrizzle()
    .select({
      id: tasks.id,
      name: tasks.name,
      start: tasks.start,
      duration: tasks.duration,
      notes: tasks.notes,
      projectId: tasks.projectId,

      recurrenceFrequency: tasks.recurrenceFrequency,
      recurrenceWeekdays: tasks.recurrenceWeekdays,
      recurrenceDayOfMonth: tasks.recurrenceDayOfMonth,
      recurrenceEnd: tasks.recurrenceEnd,

      organisationId: tasks.organisationId,
    })
    .from(tasks)
    .leftJoin(taskAssignments, eq(taskAssignments.taskId, tasks.id))
    .where(and(...whereStatements))
    .orderBy(desc(tasks.createdAt))
    .limit(query.data.limit)
    .offset(query.data.offset);

  return result;
});

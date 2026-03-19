import { z } from 'zod';

import { tasks } from '@zeity/database/task';
import { TASK_RECURRENCE_FREQUENCIES } from '@zeity/types';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  if (!(await canUserUpdateOrganisationByOrgId(session.user, organisation.value))) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const body = await readValidatedBody(
    event,
    z.object({
      name: z.string().max(200),
      start: z.coerce.date(),
      duration: z.number().nonnegative().nullable().optional(),
      notes: z.string().optional(),
      projectId: z.uuid().nullable().optional(),
      recurrenceFrequency: z.enum(TASK_RECURRENCE_FREQUENCIES),
      recurrenceWeekdays: z.array(z.number().int().min(0).max(6)).default([]),
      recurrenceDayOfMonth: z.number().int().min(1).max(31).nullable().optional(),
      recurrenceEnd: z.coerce.date().nullable().optional(),
    }).safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      statusCode: 400,
      message: 'Invalid request body',
    });
  }

  const result = await useDrizzle()
    .insert(tasks)
    .values({
      ...body.data,
      organisationId: organisation.value,
    })
    .returning()
    .then(data => data[0]);

  if (!result) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create task',
    });
  }

  return result;
});

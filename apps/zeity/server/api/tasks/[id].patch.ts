import { z } from 'zod';

import { and, eq } from '@zeity/database';
import { tasks } from '@zeity/database/task';
import { TASK_RECURRENCE_FREQUENCIES } from '@zeity/types';
import { doesTaskExist } from '~~/server/utils/task';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: z.uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  const body = await readValidatedBody(
    event,
    z
      .object({
        name: z.string().max(200),
        start: z.coerce.date(),
        duration: z.number().nonnegative().nullable(),
        notes: z.string(),
        projectId: z.uuid().nullable(),
        recurrenceFrequency: z.enum(TASK_RECURRENCE_FREQUENCIES),
        recurrenceWeekdays: z.array(z.number().int().min(0).max(6)),
        recurrenceDayOfMonth: z.number().int().min(1).max(31).nullable().optional(),
        recurrenceEnd: z.coerce.date().nullable().optional(),
      })
      .partial().safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      statusCode: 400,
      message: 'Invalid request body',
    });
  }

  const existing = await doesTaskExist(params.data.id);
  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  if (!(await canUserUpdateOrganisationByOrgId(session.user, organisation.value))) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const belongsToOrg = await doesTaskBelongToOrganisation(params.data.id, organisation.value);
  if (!belongsToOrg) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  const result = await useDrizzle()
    .update(tasks)
    .set(body.data)
    .where(and(eq(tasks.id, params.data.id), eq(tasks.organisationId, organisation.value)))
    .returning()
    .then(res => res[0]);

  return result;
});

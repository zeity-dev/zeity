import { createError, defineHandler, readValidatedBody } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { requireOrganisationSession } from '#server/utils/organisation-session';
import { doesTasksBelongToOrganisation } from '#server/utils/task';
import { getSafeRouterParams } from '#server/utils/zod';
import { and, eq } from '@zeity/database';
import { tasks } from '@zeity/database/task';
import { TASK_RECURRENCE_FREQUENCIES } from '@zeity/types';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';
import { doesTaskExist } from '~~/server/utils/task';

export default defineHandler(async event => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const params = await getSafeRouterParams(
    event,
    z.object({
      id: z.uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      status: 404,
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
      status: 400,
      message: 'Invalid request body',
    });
  }

  if (!(await canUserUpdateOrganisationByOrgId(session.user, organisation.value))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  const existing = await doesTaskExist(params.data.id);
  if (!existing) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  const belongsToOrg = await doesTasksBelongToOrganisation(params.data.id, organisation.value);
  if (!belongsToOrg) {
    throw createError({
      status: 404,
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

import { z } from 'zod';

import { eq } from '@zeity/database';
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
        end: z.coerce.date().nullable(),
        recurrence: z.object({
          frequency: z.enum(TASK_RECURRENCE_FREQUENCIES),
          weekdays: z.array(z.number().int().min(0).max(6)).optional(),
          dayOfMonth: z.number().int().min(1).max(31).optional(),
          endDate: z.string().nullable().optional(),
        }),
        timeTemplate: z.object({
          type: z.string().optional(),
          start: z.string().optional(),
          duration: z.number().nonnegative().optional(),
          notes: z.string().optional(),
          projectId: z.uuid().nullable().optional(),
        }),
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

  const result = await useDrizzle()
    .update(tasks)
    .set(body.data)
    .where(eq(tasks.id, params.data.id))
    .returning()
    .then(res => res[0]);

  return result;
});

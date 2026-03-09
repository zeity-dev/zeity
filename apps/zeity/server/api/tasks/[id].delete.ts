import { z } from 'zod';

import { eq } from '@zeity/database';
import { tasks } from '@zeity/database/task';
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

  await useDrizzle().delete(tasks).where(eq(tasks.id, params.data.id)).returning();

  return sendNoContent(event);
});

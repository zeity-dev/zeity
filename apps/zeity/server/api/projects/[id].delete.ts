import { z } from 'zod';

import { eq } from '@zeity/database';
import { projects } from '@zeity/database/project';
import { doesProjectExist } from '~~/server/utils/project';
import { userIdBelongsToOrganisation } from '~~/server/utils/organisation-permission';

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
      status: 404,
      message: 'Not Found',
    });
  }

  const existing = await doesProjectExist(params.data.id);
  if (!existing) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  if (
    !(await userIdBelongsToOrganisation(session.user.id, {
      id: organisation.value,
    }))
  ) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  await useDrizzle().delete(projects).where(eq(projects.id, params.data.id)).returning();

  return sendNoContent(event);
});

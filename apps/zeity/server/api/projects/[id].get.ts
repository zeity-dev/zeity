import { createError, defineHandler } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { requireOrganisationSession } from '#server/utils/organisation-session';
import { getSafeRouterParams } from '#server/utils/zod';
import { userIdBelongsToOrganisation } from '~~/server/utils/organisation-permission';
import { findProjectById } from '~~/server/utils/project';

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

  const result = await findProjectById(params.data.id);
  if (!result) {
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

  return result;
});

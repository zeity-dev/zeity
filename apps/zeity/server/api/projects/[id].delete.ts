import { createError, defineHandler } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { requireOrganisationSession } from '#server/utils/organisation-session';
import { getSafeRouterParams } from '#server/utils/zod';
import { eq } from '@zeity/database';
import { projects } from '@zeity/database/project';
import { userIdBelongsToOrganisation } from '~~/server/utils/organisation-permission';
import { doesProjectExist } from '~~/server/utils/project';

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

  return new Response(null, { status: 204 });
});

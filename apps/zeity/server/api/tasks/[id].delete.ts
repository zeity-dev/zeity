import { createError, defineHandler } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { requireOrganisationSession } from '#server/utils/organisation-session';
import { doesTasksBelongToOrganisation } from '#server/utils/task';
import { getSafeRouterParams } from '#server/utils/zod';
import { and, eq } from '@zeity/database';
import { tasks } from '@zeity/database/task';
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

  await useDrizzle()
    .delete(tasks)
    .where(and(eq(tasks.id, params.data.id), eq(tasks.organisationId, organisation.value)));

  return new Response(null, { status: 204 });
});

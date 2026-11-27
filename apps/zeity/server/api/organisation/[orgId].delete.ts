import { createError, defineHandler } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { getSafeRouterParams } from '#server/utils/zod';
import { eq } from '@zeity/database';
import { organisations } from '@zeity/database/organisation';
import { doesOrganisationExist } from '~~/server/utils/organisation';
import { canUserDeleteOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getSafeRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  const existing = await doesOrganisationExist(params.data.orgId);
  if (!existing) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  if (!(await canUserDeleteOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  await useDrizzle()
    .delete(organisations)
    .where(eq(organisations.id, params.data.orgId))
    .returning();

  return new Response(null, { status: 204 });
});

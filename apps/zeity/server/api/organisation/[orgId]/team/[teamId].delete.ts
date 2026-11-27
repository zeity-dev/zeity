import { createError, defineHandler } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { canUserUpdateOrganisationByOrgId } from '#server/utils/organisation-permission';
import { getSafeRouterParams } from '#server/utils/zod';
import { and, eq } from '@zeity/database';
import { organisationTeams } from '@zeity/database/organisation-team';

export default defineHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getSafeRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
      teamId: z.uuid(),
    }).safeParse,
  );
  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  if (!(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  await useDrizzle()
    .delete(organisationTeams)
    .where(
      and(
        eq(organisationTeams.organisationId, params.data.orgId),
        eq(organisationTeams.id, params.data.teamId),
      ),
    );

  return new Response(null, { status: 204 });
});

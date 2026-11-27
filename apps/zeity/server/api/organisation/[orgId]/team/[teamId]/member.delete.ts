import { createError, defineHandler, readValidatedBody } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { canUserUpdateOrganisationByOrgId } from '#server/utils/organisation-permission';
import { getSafeRouterParams } from '#server/utils/zod';
import { and, eq, inArray } from '@zeity/database';
import { organisationTeamMembers } from '@zeity/database/organisation-team-member';

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

  const body = await readValidatedBody(
    event,
    z.object({
      memberIds: z.array(z.uuid()).min(1).default([]),
    }).safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      status: 400,
      message: 'Invalid request body',
    });
  }

  if (!(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  await useDrizzle()
    .delete(organisationTeamMembers)
    .where(
      and(
        eq(organisationTeamMembers.teamId, params.data.teamId),
        inArray(organisationTeamMembers.memberId, body.data.memberIds),
      ),
    );

  return new Response(null, { status: 204 });
});

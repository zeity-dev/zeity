import { createError, defineHandler } from 'nuxt/server';
import z from 'zod';
import { requireUserSession } from '#imports';
import { doesOrganisationExist } from '#server/utils/organisation';
import { canUserUpdateOrganisationByOrgId } from '#server/utils/organisation-permission';
import { getSafeRouterParams } from '#server/utils/zod';
import { getOrganisationTeamsByOrgId } from '~~/server/utils/organisation';

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

  if (!(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  const teams = await getOrganisationTeamsByOrgId(params.data.orgId);
  return teams;
});

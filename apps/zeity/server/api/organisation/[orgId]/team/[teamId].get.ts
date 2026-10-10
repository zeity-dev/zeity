import z from 'zod';

import { organisationTeams } from '@zeity/database/organisation-team';
import { canUserReadOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
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

  const existing = await doesOrganisationExist(params.data.orgId);
  if (!existing) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  if (!(await canUserReadOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  const team = await useDrizzle()
    .select({
      id: organisationTeams.id,
      name: organisationTeams.name,
      description: organisationTeams.description,
      permissions: organisationTeams.permissions,
    })
    .from(organisationTeams)
    .where(eq(organisationTeams.id, params.data.teamId))
    .limit(1)
    .then(res => res[0]);

  return team;
});

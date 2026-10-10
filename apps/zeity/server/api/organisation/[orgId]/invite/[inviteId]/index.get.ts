import { z } from 'zod';

import { eq, asc } from '@zeity/database';
import { organisationInvites } from '@zeity/database/organisation-invite';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
      inviteId: z.uuid(),
    }).safeParse,
  );
  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  const query = await getValidatedQuery(
    event,
    z.object({
      offset: z.coerce.number().int().nonnegative().default(0),
      limit: z.coerce.number().int().positive().lte(500).default(10),
    }).safeParse,
  );
  if (!query.success) {
    throw createError({
      data: query.error,
      status: 400,
      message: 'Invalid request queries',
    });
  }

  if (!(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  const result = await useDrizzle()
    .select()
    .from(organisationInvites)
    .where(eq(organisationInvites.organisationId, params.data.orgId))
    .limit(1)
    .orderBy(asc(organisationInvites.createdAt));

  return result;
});

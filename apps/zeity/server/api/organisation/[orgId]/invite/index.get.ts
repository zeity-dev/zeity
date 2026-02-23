import { z } from 'zod';

import { eq, asc, count } from '@zeity/database';
import { organisationInvites } from '@zeity/database/organisation-invite';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      statusCode: 404,
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
      statusCode: 400,
      message: 'Invalid request queries',
    });
  }

  if (!(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const db = useDrizzle();
  const [total, items] = await Promise.all([
    db
      .select({
        count: count(),
      })
      .from(organisationInvites)
      .where(eq(organisationInvites.organisationId, params.data.orgId))
      .then(rows => rows[0]?.count || 0),

    db
      .select()
      .from(organisationInvites)
      .where(eq(organisationInvites.organisationId, params.data.orgId))
      .orderBy(asc(organisationInvites.createdAt))
      .offset(query.data.offset)
      .limit(query.data.limit),
  ]);

  return { items, total };
});

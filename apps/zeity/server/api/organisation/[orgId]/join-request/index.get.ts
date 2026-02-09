import { z } from 'zod';

import { organisationJoinRequests } from '@zeity/database/organisation-join-request';
import { users } from '@zeity/database/user';

import { canUserReadOrganisationByOrgId } from '~~/server/utils/organisation-permission';
import { JOIN_REQUEST_STATUSES } from '@zeity/types';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      orgId: z.string().uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  if (
    !(await canUserReadOrganisationByOrgId(session.user, params.data.orgId))
  ) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const query = await getValidatedQuery(
    event,
    z
      .object({
        status: z.enum(JOIN_REQUEST_STATUSES),
      })
      .partial().safeParse,
  );

  const db = useDrizzle();

  const conditions = [
    eq(organisationJoinRequests.organisationId, params.data.orgId),
  ];

  if (query.success && query.data.status) {
    conditions.push(eq(organisationJoinRequests.status, query.data.status));
  }

  const requests = await db
    .select({
      id: organisationJoinRequests.id,
      organisationId: organisationJoinRequests.organisationId,
      userId: organisationJoinRequests.userId,
      status: organisationJoinRequests.status,
      message: organisationJoinRequests.message,
      createdAt: organisationJoinRequests.createdAt,
      updatedAt: organisationJoinRequests.updatedAt,
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
      },
    })
    .from(organisationJoinRequests)
    .leftJoin(users, eq(organisationJoinRequests.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(organisationJoinRequests.createdAt));

  return requests;
});

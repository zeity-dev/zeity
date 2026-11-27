import { createError, defineHandler, getValidatedQuery } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { and, desc, eq, useDrizzle } from '#server/utils/drizzle';
import { getSafeRouterParams } from '#server/utils/zod';
import { organisationJoinRequests } from '@zeity/database/organisation-join-request';
import { users } from '@zeity/database/user';
import { JOIN_REQUEST_STATUSES } from '@zeity/types';
import { canUserReadOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getSafeRouterParams(
    event,
    z.object({
      orgId: z.string().uuid(),
    }).safeParse,
  );

  if (!params.success) {
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

  const query = await getValidatedQuery(
    event,
    z
      .object({
        status: z.enum(JOIN_REQUEST_STATUSES),
      })
      .partial().safeParse,
  );

  const db = useDrizzle();

  const conditions = [eq(organisationJoinRequests.organisationId, params.data.orgId)];

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

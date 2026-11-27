import { createError, defineHandler } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { and, eq, useDrizzle } from '#server/utils/drizzle';
import { getSafeRouterParams } from '#server/utils/zod';
import { organisationJoinRequests } from '@zeity/database/organisation-join-request';
import { JOIN_REQUEST_STATUS_PENDING, JOIN_REQUEST_STATUS_REJECTED } from '@zeity/types';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getSafeRouterParams(
    event,
    z.object({
      orgId: z.string().uuid(),
      requestId: z.string().uuid(),
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

  const db = useDrizzle();

  // Find the join request
  const joinRequest = await db
    .select()
    .from(organisationJoinRequests)
    .where(
      and(
        eq(organisationJoinRequests.id, params.data.requestId),
        eq(organisationJoinRequests.organisationId, params.data.orgId),
        eq(organisationJoinRequests.status, JOIN_REQUEST_STATUS_PENDING),
      ),
    )
    .limit(1)
    .then(res => res[0]);

  if (!joinRequest) {
    throw createError({
      status: 404,
      message: 'Join request not found or already processed',
    });
  }

  // Update join request status
  const result = await db
    .update(organisationJoinRequests)
    .set({
      status: JOIN_REQUEST_STATUS_REJECTED,
    })
    .where(eq(organisationJoinRequests.id, joinRequest.id))
    .returning()
    .then(res => res[0]);

  return result;
});

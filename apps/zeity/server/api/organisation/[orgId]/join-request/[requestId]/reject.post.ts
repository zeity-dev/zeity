import { z } from 'zod';

import { organisationJoinRequests } from '@zeity/database/organisation-join-request';

import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';
import {
  JOIN_REQUEST_STATUS_PENDING,
  JOIN_REQUEST_STATUS_REJECTED,
} from '@zeity/types';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      orgId: z.string().uuid(),
      requestId: z.string().uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  if (
    !(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))
  ) {
    throw createError({
      statusCode: 403,
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
    .then((res) => res[0]);

  if (!joinRequest) {
    throw createError({
      statusCode: 404,
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
    .then((res) => res[0]);

  return result;
});

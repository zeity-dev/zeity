import { z } from 'zod';

import {
  JOIN_REQUEST_STATUS_ACCEPTED,
  JOIN_REQUEST_STATUS_PENDING,
  ORGANISATION_MEMBER_ROLE_MEMBER,
} from '@zeity/types/organisation';
import { organisationJoinRequests } from '@zeity/database/organisation-join-request';
import { organisationMembers } from '@zeity/database/organisation-member';

import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';
import { checkOrganisationMembersQuota } from '~~/server/utils/organisation-quota';

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

  if ((await checkOrganisationMembersQuota(params.data.orgId)) === false) {
    throw createError({
      statusCode: 403,
      message: 'User quota exceeded',
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

  // Create member and update request status in a transaction
  const result = await db.transaction(async (tx) => {
    // Add user to organisation
    const member = await tx
      .insert(organisationMembers)
      .values({
        organisationId: joinRequest.organisationId,
        userId: joinRequest.userId,
        role: ORGANISATION_MEMBER_ROLE_MEMBER,
      })
      .returning()
      .then((res) => res[0]);

    if (!member) {
      throw createError({
        statusCode: 500,
        message: 'Failed to add member to organisation',
      });
    }

    // Update join request status
    const updatedRequest = await tx
      .update(organisationJoinRequests)
      .set({
        status: JOIN_REQUEST_STATUS_ACCEPTED,
      })
      .where(eq(organisationJoinRequests.id, joinRequest.id))
      .returning()
      .then((res) => res[0]);

    return { member, request: updatedRequest };
  });

  return result;
});

import { z } from 'zod';

import { organisations } from '@zeity/database/organisation';
import { organisationJoinRequests } from '@zeity/database/organisation-join-request';
import { organisationMembers } from '@zeity/database/organisation-member';
import { JOIN_REQUEST_STATUS_PENDING } from '@zeity/types';

const invalidTokenError = createError({
  statusCode: 400,
  message: 'Invalid or expired invite link',
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const body = await getValidatedQuery(
    event,
    z.object({
      token: z.string(),
    }).safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      statusCode: 400,
      message: 'Invalid request body',
    });
  }

  const db = useDrizzle();

  const payload = await verifyToken(
    await useJwtSecret(event),
    body.data.token,
  ).catch(() => {
    throw invalidTokenError;
  });

  if (
    !payload ||
    payload.type !== 'organisation-invite' ||
    !payload.organisationId
  ) {
    throw invalidTokenError;
  }
  const organisationId = payload.organisationId as string;

  // Check if organisation exists
  const organisation = await db
    .select({
      id: organisations.id,
      name: organisations.name,
      image: organisations.image,
    })
    .from(organisations)
    .where(eq(organisations.id, organisationId))
    .limit(1)
    .then((res) => res[0]);

  if (!organisation) {
    throw invalidTokenError;
  }

  // Check if user is already a member
  const existingMember = await db
    .select()
    .from(organisationMembers)
    .where(
      and(
        eq(organisationMembers.organisationId, organisationId),
        eq(organisationMembers.userId, session.user.id),
      ),
    )
    .limit(1)
    .then((res) => !!res[0]);

  // Check if user already has a pending request
  const existingRequest = await db
    .select()
    .from(organisationJoinRequests)
    .where(
      and(
        eq(organisationJoinRequests.organisationId, organisationId),
        eq(organisationJoinRequests.userId, session.user.id),
        eq(organisationJoinRequests.status, JOIN_REQUEST_STATUS_PENDING),
      ),
    )
    .limit(1)
    .then((res) => !!res[0]);

  return {
    organisation,
    isMember: existingMember,
    requested: existingRequest,
  };
});

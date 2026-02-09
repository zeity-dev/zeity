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

  const body = await readValidatedBody(
    event,
    z.object({
      token: z.string(),
      message: z.string().optional(),
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

  const payload = await verifyToken(await useJwtSecret(event), body.data.token);

  if (
    !payload ||
    payload.type !== 'organisation-invite' ||
    !payload.organisationId
  ) {
    throw invalidTokenError;
  }

  // Check if organisation exists
  const organisation = await db
    .select()
    .from(organisations)
    .where(eq(organisations.id, payload.organisationId as string))
    .limit(1)
    .then((res) => res[0]);

  if (!organisation) {
    throw invalidTokenError;
  }

  const organisationId = payload.organisationId as string;

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

  if (existingMember) {
    throw createError({
      statusCode: 400,
      message: 'Already a member of this organisation',
    });
  }

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

  if (existingRequest) {
    throw createError({
      statusCode: 400,
      message: 'You already have a pending join request for this organisation',
    });
  }

  // Create join request
  const result = await db
    .insert(organisationJoinRequests)
    .values({
      organisationId: organisationId,
      userId: session.user.id,
      message: body.data.message,
      status: JOIN_REQUEST_STATUS_PENDING,
    })
    .returning()
    .then((res) => res[0]);

  return result;
});

import { z } from 'zod';

import { organisationInvites } from '@zeity/database/organisation-invite';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const body = await readValidatedBody(
    event,
    z.object({
      inviteId: z.uuid(),
    }).safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      statusCode: 400,
      message: 'Invalid request body',
    });
  }

  const invite = await useDrizzle()
    .select()
    .from(organisationInvites)
    .where(eq(organisationInvites.id, body.data.inviteId))
    .limit(1)
    .then((res) => res[0]);

  if (!invite || invite?.email !== session.user.email) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const result = await useDrizzle()
    .delete(organisationInvites)
    .where(eq(organisationInvites.id, invite.id));

  return result;
});

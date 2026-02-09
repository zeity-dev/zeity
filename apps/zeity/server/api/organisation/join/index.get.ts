import { z } from 'zod';

import { eq } from '@zeity/database';
import { organisations } from '@zeity/database/organisation';
import { organisationInvites } from '@zeity/database/organisation-invite';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const query = await getValidatedQuery(
    event,
    z.object({
      token: z.string(),
    }).safeParse,
  );
  if (!query.success) {
    console.log('Invalid request query', query.error);
    throw createError({
      data: query.error,
      statusCode: 400,
      message: 'Invalid request query',
    });
  }

  const jwt = await useUserInvite(event)
    .verifyToken(query.data.token)
    .catch(() => {
      throw createError({
        statusCode: 400,
        message: 'Invalid token',
      });
    });

  const result = await useDrizzle()
    .select({
      email: organisationInvites.email,
      createdAt: organisationInvites.createdAt,
      organisation: {
        name: organisations.name,
        image: organisations.image,
      },
    })
    .from(organisationInvites)
    .leftJoin(
      organisations,
      eq(organisations.id, organisationInvites.organisationId),
    )
    .where(eq(organisationInvites.id, jwt.inviteId))
    .limit(1)
    .then((res) => res[0]);

  if (!result || result?.email !== session.user.email) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  return result;
});

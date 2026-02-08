import { z } from 'zod';

import { eq } from '@zeity/database';
import { userAccounts } from '@zeity/database/user-account';
import { AUTH_PROVIDERS } from '~~/server/utils/auth-providers';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      providerId: z.enum(AUTH_PROVIDERS),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  const account = await useDrizzle()
    .select()
    .from(userAccounts)
    .where(
      and(
        eq(userAccounts.userId, session.user.id),
        eq(userAccounts.providerId, params.data.providerId),
      ),
    )
    .limit(1)
    .then((rows) => rows[0]);

  if (!account) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  await useDrizzle()
    .delete(userAccounts)
    .where(eq(userAccounts.id, account.id))
    .returning();

  return sendNoContent(event);
});

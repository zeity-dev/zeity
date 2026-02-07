import z from 'zod';

import { userAccounts } from '@zeity/database/user-account';
import { PASSWORD_PROVIDER_ID } from '~~/server/utils/auth-providers';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const { currentPassword, newPassword } = await readValidatedBody(
    event,
    z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    }).parse,
  );

  if (currentPassword === newPassword) {
    throw createError({
      statusCode: 400,
      message: 'New password must be different from current password',
    });
  }

  const db = useDrizzle();
  const account = await db
    .select()
    .from(userAccounts)
    .where(
      and(
        eq(userAccounts.userId, session.user.id),
        eq(userAccounts.providerId, PASSWORD_PROVIDER_ID),
      ),
    )
    .limit(1)
    .then((res) => res[0]);

  if (!account) {
    await db.insert(userAccounts).values({
      userId: session.user.id,
      accountId: session.user.id,
      providerId: PASSWORD_PROVIDER_ID,
      password: await hashPassword(newPassword),
    });
  } else {
    if (
      account.password &&
      !(await verifyPassword(account.password, currentPassword))
    ) {
      throw createError({
        statusCode: 401,
        message: 'Invalid current password',
      });
    }

    await db
      .update(userAccounts)
      .set({ password: await hashPassword(newPassword) })
      .where(
        and(
          eq(userAccounts.userId, session.user.id),
          eq(userAccounts.providerId, PASSWORD_PROVIDER_ID),
        ),
      );
  }

  return setResponseStatus(event, 201);
});

import { z } from 'zod';

import { users } from '@zeity/database/user';
import { userAccounts } from '@zeity/database/user-account';
import { authOTP } from '@zeity/database/auth-otp';

import { useUserPasswordReset } from '~~/server/utils/user-password-reset';

export default defineEventHandler(async (event) => {
  const { code, password } = await readValidatedBody(
    event,
    z.object({
      code: z.string().trim(),
      password: z.string().min(8),
    }).parse,
  );

  const request = await useUserPasswordReset(event).findResetRequest(code);
  if (!request) {
    return createError({
      statusCode: 401,
      // This message is intentionally vague to prevent user enumeration attacks.
      message: 'Invalid or expired password reset code',
    });
  }

  await useDrizzle().transaction(async (tx) => {
    const user = await tx
      .select()
      .from(users)
      .where(eq(users.id, request.userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      return createError({
        statusCode: 401,
        // This message is intentionally vague to prevent user enumeration attacks.
        message: 'Invalid or expired password reset code',
      });
    }

    await tx
      .update(userAccounts)
      .set({ password: await hashPassword(password) })
      .where(
        and(
          eq(userAccounts.userId, user.id),
          eq(userAccounts.providerId, PASSWORD_PROVIDER_ID),
        ),
      );

    await tx.delete(authOTP).where(eq(authOTP.id, request.id));

    useMailer(event).sendMessageMail(
      { email: user.email, name: user.name },
      `Your Password Has Been Reset`,
      [
        `This is a confirmation that the password for your account ${user.email} has just been changed.`,
      ],
      [],
    );

    await storeUserSession(event, user);
  });

  return setResponseStatus(event, 201);
});

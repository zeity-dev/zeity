import { defineEventHandler, readValidatedBody, createError, setResponseStatus } from 'nuxt/server';
import { z } from 'zod';

import { eq, and } from '@zeity/database';
import { users } from '@zeity/database/user';
import { userAccounts } from '@zeity/database/user-account';
import { authOTP } from '@zeity/database/auth-otp';

import { useDrizzle } from '~~/server/utils/drizzle';
import { useUserPasswordReset } from '~~/server/utils/user-password-reset';
import { PASSWORD_PROVIDER_ID } from '~~/server/utils/auth-providers';
import { useMailer } from '~~/server/utils/mailer';
import { storeUserSession } from '~~/server/utils/user-session';

export default defineEventHandler(async event => {
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
      status: 401,
      // This message is intentionally vague to prevent user enumeration attacks.
      statusText: 'Invalid or expired password reset code',
    });
  }

  await useDrizzle().transaction(async tx => {
    const user = await tx
      .select()
      .from(users)
      .where(eq(users.id, request.userId))
      .limit(1)
      .then(rows => rows[0]);

    if (!user) {
      return createError({
        status: 401,
        // This message is intentionally vague to prevent user enumeration attacks.
        message: 'Invalid or expired password reset code',
      });
    }

    await tx
      .update(userAccounts)
      .set({ password: await hashPassword(password) })
      .where(
        and(eq(userAccounts.userId, user.id), eq(userAccounts.providerId, PASSWORD_PROVIDER_ID)),
      );

    await tx.delete(authOTP).where(eq(authOTP.id, request.id));

    await useMailer().sendMessageMail(
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

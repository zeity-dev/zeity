import { authPasswordReset } from '@zeity/database/auth-password-reset';
import { users } from '@zeity/database/user';
import { z } from 'zod';
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
  console.log('Reset request:', request);
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
      .then((rows) => rows[0]);

    if (!user) {
      return createError({
        statusCode: 401,
        // This message is intentionally vague to prevent user enumeration attacks.
        message: 'Invalid or expired password reset code',
      });
    }

    await tx
      .update(users)
      .set({ password: await hashPassword(password) })
      .where(eq(users.id, user.id));

    await tx
      .delete(authPasswordReset)
      .where(eq(authPasswordReset.id, request.id));

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

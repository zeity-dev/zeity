import { z } from 'zod';

import { count } from '@zeity/database';
import { users } from '@zeity/database/user';
import { authOTP } from '@zeity/database/auth-otp';
import { useUserPasswordReset } from '~~/server/utils/user-password-reset';

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(
    event,
    z.object({
      email: z.email().min(1).toLowerCase().trim(),
    }).parse,
  );

  const db = useDrizzle();
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .then((rows) => rows[0]);

  if (!dbUser) {
    // intentionally send no error to prevent user enumeration
    return setResponseStatus(event, 201);
  }

  // Check for existing valid OTPs to prevent abuse
  const existingOTPs = await db
    .select({ count: count() })
    .from(authOTP)
    .where(
      and(
        eq(authOTP.userId, dbUser.id),
        eq(authOTP.type, OTP_TYPE_PASSWORD_RESET),
        gt(authOTP.expiresAt, new Date()),
      ),
    )
    .then((res) => res[0]?.count || 0);
  // Limit to 3 active reset requests per user to prevent abuse
  if (existingOTPs > 3) {
    throw createError({
      statusCode: 429,
      message: `Too many password reset requests. Please try again later.`,
    });
  }

  const link = await useUserPasswordReset(event).generateResetLink(dbUser.id);

  await useMailer(event).sendMessageMail(
    { email: dbUser.email, name: dbUser.name },
    `Password Reset Request`,
    [`You have requested to reset your password.`],
    [
      {
        class: 'text-center',
        children: [
          {
            url: link,
            text: 'Reset Password',
          },
        ],
      },
      {
        children: [
          {
            class: 'text-sm text-gray-500',
            text: 'If you did not request this, please ignore this email. The link will expire in 5 hours.',
          },
        ],
      },
    ],
  );

  return setResponseStatus(event, 201);
});

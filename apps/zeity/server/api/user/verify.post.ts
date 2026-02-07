import { z } from 'zod';
import { users } from '@zeity/database/user';
import {
  deleteUsersOTPs,
  OTP_TYPE_EMAIL_VERIFICATION,
} from '~~/server/utils/auth-otp';
import {
  isUserVerified,
  verifyEmailVerificationOTP,
} from '~~/server/utils/user-verification';
import { refreshUserSession } from '~~/server/utils/user-session';

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const query = await readValidatedBody(
    event,
    z.object({
      code: z.string().length(6),
    }).safeParse,
  );
  if (!query.success) {
    throw createError({
      data: query.error,
      statusCode: 400,
      message: 'Invalid request query',
    });
  }

  // verify otp
  const otp = await verifyEmailVerificationOTP(user.id, query.data.code).catch(
    (e: unknown) => {
      console.error(e);
      return null;
    },
  );

  // if token is invalid or userId in token does not match the session user id
  if (!otp) {
    throw createError({
      statusCode: 400,
      message: 'Invalid otp',
    });
  }

  await deleteUsersOTPs(user.id, OTP_TYPE_EMAIL_VERIFICATION);

  // check if email is already verified
  const emailVerified = await isUserVerified(user.id);

  if (emailVerified) {
    throw createError({
      statusCode: 400,
      message: 'Email already verified',
    });
  }

  // update user emailVerified
  await useDrizzle()
    .update(users)
    .set({
      emailVerified: new Date(),
    })
    .where(eq(users.id, user.id));

  await refreshUserSession(event);

  return sendNoContent(event, 202);
});

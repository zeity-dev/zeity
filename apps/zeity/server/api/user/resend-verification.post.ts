import { createError, defineHandler } from 'nuxt/server';
import { requireUserSession } from '#imports';
import { eq, useDrizzle } from '#server/utils/drizzle';
import { useMailer } from '#server/utils/mailer';
import { users } from '@zeity/database/user';
import { OTP_TYPE_EMAIL_VERIFICATION, deleteUsersOTPs } from '~~/server/utils/auth-otp';
import { createEmailVerificationOTP } from '~~/server/utils/user-verification';

export default defineHandler(async event => {
  const session = await requireUserSession(event);

  const user = await useDrizzle()
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .then(rows => rows[0]);

  if (!user) {
    throw createError({
      status: 400,
      message: 'user not found',
    });
  }

  if (user.emailVerified) {
    throw createError({
      status: 400,
      message: 'Email already verified',
    });
  }

  // delete previous OTPs of the user
  await deleteUsersOTPs(user.id, OTP_TYPE_EMAIL_VERIFICATION);

  const otp = await createEmailVerificationOTP(session.user.id);
  await useMailer().sendMessageMail(
    { email: user.email, name: user.name },
    'Verify your email',
    ['Please verify your email address by entering the code below:'],
    [{ children: [{ text: otp, class: 'font-bold text-2xl' }] }],
  );

  return new Response(null, { status: 204 });
});

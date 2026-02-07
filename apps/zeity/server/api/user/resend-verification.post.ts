import { users } from '@zeity/database/user';
import {
  deleteUsersOTPs,
  OTP_TYPE_EMAIL_VERIFICATION,
} from '~~/server/utils/auth-otp';
import { createEmailVerificationOTP } from '~~/server/utils/user-verification';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const user = await useDrizzle()
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .then((rows) => rows[0]);

  if (!user) {
    throw createError({
      statusCode: 400,
      message: 'user not found',
    });
  }

  if (user.emailVerified) {
    throw createError({
      statusCode: 400,
      message: 'Email already verified',
    });
  }

  // delete previous OTPs of the user
  await deleteUsersOTPs(user.id, OTP_TYPE_EMAIL_VERIFICATION);

  const otp = await createEmailVerificationOTP(session.user.id);
  await useMailer(event).sendMessageMail(
    { email: user.email, name: user.name },
    'Verify your email',
    ['Please verify your email address by entering the code below:'],
    [{ children: [{ text: otp, class: 'font-bold text-2xl' }] }],
  );

  return sendNoContent(event);
});

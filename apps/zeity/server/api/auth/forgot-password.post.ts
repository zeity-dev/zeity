import { users } from '@zeity/database/user';
import { z } from 'zod';
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

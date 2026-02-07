import { z } from 'zod';

import { users } from '@zeity/database/user';
import { userAccounts } from '@zeity/database/user-account';
import { createEmailVerificationOTP } from '~~/server/utils/user-verification';

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readValidatedBody(
    event,
    z.object({
      name: z.string().min(1).trim(),
      email: z.email().min(1).toLowerCase().trim(),
      password: z.string().min(8),
    }).parse,
  );

  const db = useDrizzle();
  const dbUser = await db.transaction(async (tx) => {
    const user = await tx
      .insert(users)
      .values({
        name,
        email,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
      })
      .then((rows) => rows[0])
      .catch((e) => {
        console.error(e);

        throw createError({
          statusCode: 400,
          message: 'User already exists',
        });
      });

    if (!user) {
      throw createError({
        statusCode: 400,
        message: 'User already exists',
      });
    }

    await tx.insert(userAccounts).values({
      userId: user.id,
      accountId: user.id,
      providerId: PASSWORD_PROVIDER_ID,
      password: await hashPassword(password),
    });

    return user;
  });

  await storeUserSession(event, dbUser);

  const otp = await createEmailVerificationOTP(dbUser.id);

  await useMailer(event).sendWelcomeMail(
    { email: dbUser.email, name: dbUser.name },
    otp,
  );

  return setResponseStatus(event, 201);
});

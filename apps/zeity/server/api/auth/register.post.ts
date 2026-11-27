import { createError, defineEventHandler, readValidatedBody, setResponseStatus } from 'nuxt/server';
import { z } from 'zod';
import { hashPassword } from '#imports';
import { users } from '@zeity/database/user';
import { userAccounts } from '@zeity/database/user-account';
import { PASSWORD_PROVIDER_ID } from '~~/server/utils/auth-providers';
import { useDrizzle } from '~~/server/utils/drizzle';
import { useMailer } from '~~/server/utils/mailer';
import { storeUserSession } from '~~/server/utils/user-session';
import { createEmailVerificationOTP } from '~~/server/utils/user-verification';

export default defineEventHandler(async event => {
  const { name, email, password } = await readValidatedBody(
    event,
    z.object({
      name: z.string().min(1).trim(),
      email: z.email().min(1).toLowerCase().trim(),
      password: z.string().min(8),
    }).parse,
  );

  const db = useDrizzle();
  const dbUser = await db.transaction(async tx => {
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
      .then(rows => rows[0])
      .catch(e => {
        console.error(e);

        throw createError({
          status: 400,
          statusText: 'User already exists',
        });
      });

    if (!user) {
      throw createError({
        status: 400,
        statusText: 'User already exists',
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

  await useMailer().sendWelcomeMail({ email: dbUser.email, name: dbUser.name }, otp);

  return setResponseStatus(event, 201);
});

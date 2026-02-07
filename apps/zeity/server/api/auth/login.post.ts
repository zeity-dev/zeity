import z from 'zod';

import { users } from '@zeity/database/user';
import { userAccounts } from '@zeity/database/user-account';
import { PASSWORD_PROVIDER_ID } from '~~/server/utils/auth-providers';

const invalidCredentialsError = createError({
  statusCode: 401,
  // This message is intentionally vague to prevent user enumeration attacks.
  message: 'Invalid credentials',
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(
    event,
    z.object({
      email: z.email().toLowerCase().trim(),
      password: z.string().min(8),
    }).parse,
  );

  const db = useDrizzle();
  const { user, user_account } = await db
    .select()
    .from(users)
    .leftJoin(userAccounts, eq(users.id, userAccounts.userId))
    .where(
      and(
        eq(users.email, email),
        eq(userAccounts.providerId, PASSWORD_PROVIDER_ID),
      ),
    )
    .limit(1)
    .then((res) => res[0] || { user: null, user_account: null });

  console.log('Login attempt:', { email, user, user_account });

  if (!user || !user_account?.password) {
    throw invalidCredentialsError;
  }

  if (!(await verifyPassword(user_account.password, password))) {
    throw invalidCredentialsError;
  }

  if (passwordNeedsReHash(user_account.password)) {
    await db
      .update(userAccounts)
      .set({ password: await hashPassword(password) })
      .where(
        and(
          eq(userAccounts.userId, user.id),
          eq(userAccounts.providerId, PASSWORD_PROVIDER_ID),
        ),
      );
  }

  await storeUserSession(event, user);

  return setResponseStatus(event, 201);
});

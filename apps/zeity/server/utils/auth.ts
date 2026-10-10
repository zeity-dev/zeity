import { eq } from '@zeity/database';
import { users, type User } from '@zeity/database/user';
import { userAccounts } from '@zeity/database/user-account';

export function linkUserAccount(
  userId: string,
  providerId: string,
  accountId: string,
  scope?: string,
) {
  return useDrizzle()
    .insert(userAccounts)
    .values({
      userId,
      accountId,
      providerId,
      scope,
    })
    .returning()
    .then(rows => rows[0]);
}

export async function handleOAuthLogin(
  providerId: string,
  accountId: string,
  data: { email: string; name?: string; scope?: string },
): Promise<User | null> {
  return useDrizzle().transaction(async tx => {
    const oauthAccount = await tx
      .select()
      .from(users)
      .innerJoin(userAccounts, eq(users.id, userAccounts.userId))
      .where(and(eq(userAccounts.accountId, accountId), eq(userAccounts.providerId, providerId)))
      .limit(1)
      .then(rows => rows[0]);
    if (oauthAccount) {
      return oauthAccount.user;
    }

    const dbUser = await tx
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1)
      .then(rows => rows[0]);
    if (dbUser) {
      await tx
        .insert(userAccounts)
        .values({
          userId: dbUser.id,
          accountId,
          providerId,
          scope: data.scope,
        })
        .returning()
        .then(rows => rows[0]);
      return dbUser;
    }

    const newUser = await tx
      .insert(users)
      .values({
        name: data.name || data.email,
        email: data.email,
      })
      .returning()
      .then(rows => rows[0]);
    if (newUser) {
      await tx
        .insert(userAccounts)
        .values({
          userId: newUser.id,
          accountId,
          providerId,
          scope: data.scope,
        })
        .returning()
        .then(rows => rows[0]);
      return newUser;
    }

    return null;
  });
}

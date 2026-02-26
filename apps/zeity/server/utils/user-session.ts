import type { H3Event } from 'h3';
import { type User, users } from '@zeity/database/user';

export function storeUserSession(
  event: H3Event,
  user: Pick<User, 'id' | 'email' | 'name' | 'emailVerified' | 'image'>,
) {
  return setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      verified: Boolean(user.emailVerified),
      image: user.image,
    },
  });
}

export async function refreshUserSession(
  event: H3Event,
  user?: Pick<User, 'id' | 'email' | 'name' | 'emailVerified' | 'image'> | null,
) {
  const session = await getUserSession(event);

  if (!session?.user?.id) {
    return;
  }

  if (!user) {
    user = await getUser(session.user.id);
  }

  if (!user) {
    return;
  }

  await setUserSession(event, {
    ...session,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      verified: Boolean(user.emailVerified),
      image: user.image,
    },
  });
}

function getUser(userId: string) {
  return useDrizzle()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      emailVerified: users.emailVerified,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .then(rows => rows[0]);
}

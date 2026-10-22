import { type RequestEvent } from 'nuxt/server';
import { add } from 'date-fns';
import { type User, users } from '@zeity/database/user';
import { eq, useDrizzle } from './drizzle';

export function storeUserSession(
  event: RequestEvent,
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
  event: RequestEvent,
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

  await setUserSession(
    event,
    {
      ...session,
      updatedAt: Date.now(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: Boolean(user.emailVerified),
        image: user.image,
      },
    },
    {
      cookie: {
        expires: add(new Date(Date.now()), { seconds: useRuntimeConfig().session.maxAge }),
      },
    },
  );
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

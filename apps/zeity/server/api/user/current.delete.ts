import { createError, defineHandler } from 'nuxt/server';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { eq } from '@zeity/database';
import { users } from '@zeity/database/user';

export default defineHandler(async event => {
  const session = await requireUserSession(event);

  if (!session.user.id) {
    throw createError({
      status: 401,
      message: 'Unauthorized',
    });
  }

  await useDrizzle().delete(users).where(eq(users.id, session.user.id));

  return new Response(null, { status: 204 });
});

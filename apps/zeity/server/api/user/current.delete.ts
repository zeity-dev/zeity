import { eq } from '@zeity/database';
import { users } from '@zeity/database/user';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!session.user.id) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  await useDrizzle().delete(users).where(eq(users.id, session.user.id));

  await clearUserSession(event);

  return sendNoContent(event);
});

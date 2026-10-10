import { z } from 'zod';

import { eq } from '@zeity/database';
import { users } from '@zeity/database/user';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);

  const schema = z
    .object({
      name: z.string().min(1).trim(),
    })
    .partial();

  const body = await readValidatedBody(event, schema.safeParse);

  if (!body.success) {
    throw createError({
      data: body.error,
      status: 400,
      message: 'Invalid request body',
    });
  }

  const user = await useDrizzle()
    .update(users)
    .set(body.data)
    .where(eq(users.id, session.user.id))
    .returning({
      id: users.id,
      name: users.name,
      image: users.image,
      email: users.email,
      emailVerified: users.emailVerified,
    })
    .then(rows => rows[0]);

  await refreshUserSession(event, user);

  return {
    user,
  };
});

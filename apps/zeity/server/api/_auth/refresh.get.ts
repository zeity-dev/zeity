import { defineEventHandler } from 'nuxt/server';
import { requireUserSession } from '#imports';
import { refreshUserSession } from '#server/utils/user-session';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);
  if (!session.user?.id) {
    return;
  }

  await refreshUserSession(event);
});

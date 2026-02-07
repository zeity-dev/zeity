import { APPLE_PROVIDER_ID } from '~~/server/utils/auth-providers';

export default defineOAuthAppleEventHandler({
  async onSuccess(event, { user, payload }) {
    const name = [user?.name?.firstName, user?.name?.lastName]
      .filter(Boolean)
      .join(' ');

    const linkedUser = await handleOAuthLogin(APPLE_PROVIDER_ID, payload.sub, {
      email: payload.email,
      name,
    });
    if (!linkedUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found',
      });
    }

    await storeUserSession(event, linkedUser);
    return sendRedirect(event, '/auth');
  },
});

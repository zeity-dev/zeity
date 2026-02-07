import { handleOAuthLogin } from '~~/server/utils/auth';
import { GOOGLE_PROVIDER_ID } from '~~/server/utils/auth-providers';

export default defineOAuthGoogleEventHandler({
  config: {
    authorizationParams: {
      access_type: 'offline',
    },
  },
  async onSuccess(event, { user }) {
    const linkedUser = await handleOAuthLogin(GOOGLE_PROVIDER_ID, user.sub, {
      email: user.email,
      name: user.name,
      scope: user.scope,
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

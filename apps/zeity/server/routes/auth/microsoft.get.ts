import { handleOAuthLogin } from '~~/server/utils/auth';
import { MICROSOFT_PROVIDER_ID } from '~~/server/utils/auth-providers';

export default defineOAuthMicrosoftEventHandler({
  async onSuccess(event, { user }) {
    const linkedUser = await handleOAuthLogin(MICROSOFT_PROVIDER_ID, user.id, {
      email: user.mail,
      name: user.displayName,
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

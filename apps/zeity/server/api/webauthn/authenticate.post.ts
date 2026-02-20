import { users } from '@zeity/database/user';
import { userCredentials } from '@zeity/database/user-credential';
import { getChallenge, storeChallenge } from '../../utils/webauthn';

export default defineWebAuthnAuthenticateEventHandler({
  storeChallenge(event, challenge, attemptId) {
    return storeChallenge(challenge, attemptId);
  },

  getChallenge(event, attemptId) {
    return getChallenge(attemptId);
  },

  async allowCredentials(event, username) {
    const user = await useDrizzle()
      .select({ credentials: {
        id: userCredentials.id,
        trasports: userCredentials.transports,
      } })
      .from(users)
      .rightJoin(userCredentials, eq(userCredentials.userId, users.id))
      .where(eq(users.email, username));

    return user.map((item) => item.credentials) || [];
  },

  async getCredential(event, credentialID) {
    const credential = await useDrizzle()
      .select({
        id: userCredentials.id,
        userId: userCredentials.userId,
        publicKey: userCredentials.publicKey,
        counter: userCredentials.counter,
        backedUp: userCredentials.backedUp,
        transports: userCredentials.transports,
        user: users,
      })
      .from(userCredentials)
      .innerJoin(users, eq(users.id, userCredentials.userId))
      .where(eq(userCredentials.id, credentialID))
      .then((rows) => rows[0]);

    if (!credential) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Credential not found',
      });
    }

    return credential;
  },

  async onSuccess(event, { credential }) {
    await storeUserSession(event, credential.user);
  },
});

import { eq } from '@zeity/database';
import { authChallenge } from '@zeity/database/auth-challenge';

export async function storeChallenge(
  challenge: string,
  attemptId: string
): Promise<void> {
  await useDrizzle().insert(authChallenge).values({
    id: attemptId,
    challenge,
  });
}

export async function getChallenge(attemptId: string): Promise<string> {
  const db = useDrizzle();
  const challenge = await db
    .select({ challenge: authChallenge.challenge })
    .from(authChallenge)
    .where(eq(authChallenge.id, attemptId))
    .limit(1)
    .then((rows) => rows[0]?.challenge)
    .catch(() => undefined);

  // Make sure to always remove the attempt because they are single use only!
  await db.delete(authChallenge).where(eq(authChallenge.id, attemptId));

  if (!challenge) {
    throw createError({ statusCode: 400, message: 'Challenge expired' });
  }

  return challenge;
}

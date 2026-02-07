import { authOTP } from '@zeity/database/auth-otp';

export const OTP_TYPE_EMAIL_VERIFICATION = 'email-verification';
export const OTP_TYPE_PASSWORD_RESET = 'password-reset';

export function deleteUsersOTPs(userId: string, type: string) {
  return useDrizzle()
    .delete(authOTP)
    .where(and(eq(authOTP.type, type), eq(authOTP.userId, userId)));
}
export function deleteExpiredOTPs() {
  const now = new Date();
  return useDrizzle().delete(authOTP).where(lte(authOTP.expiresAt, now));
}

export async function findOTP(code: string, type: string) {
  await deleteExpiredOTPs();

  const otp = await useDrizzle()
    .select()
    .from(authOTP)
    .where(
      and(
        eq(authOTP.type, type),
        eq(authOTP.code, code),
        gte(authOTP.expiresAt, new Date()),
      ),
    )
    .limit(1)
    .then((rows) => rows[0]);

  return otp;
}

export async function verifyOTP(userId: string, code: string, type: string) {
  await deleteExpiredOTPs();

  const otp = await useDrizzle()
    .select()
    .from(authOTP)
    .where(
      and(
        eq(authOTP.type, type),
        eq(authOTP.userId, userId),
        eq(authOTP.code, code),
        gte(authOTP.expiresAt, new Date()),
      ),
    )
    .limit(1)
    .then((rows) => rows[0]);

  return otp;
}

export async function createOTP(userId: string, code: string, type: string) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

  await useDrizzle()
    .insert(authOTP)
    .values({
      type,
      code,
      expiresAt,
      userId,
    })
    .returning({ id: authOTP.id });
}

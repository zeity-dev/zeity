import { randomInt } from 'node:crypto';
import type { H3Event } from 'h3';

import { users } from '@zeity/database/user';
import { useJwtSecret } from './jwt-secret';
import { generateToken, verifyToken } from './jwt';
import { OTP_TYPE_EMAIL_VERIFICATION } from './auth-otp';

const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function generateOTP(length = 6) {
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += numbers[randomInt(numbers.length)];
  }

  return otp;
}

export async function isUserVerified(userId: string) {
  const rows = await useDrizzle()
    .select({ emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, userId));
  return !!rows[0]?.emailVerified;
}

export function generateEmailVerificationToken(
  secret: Uint8Array,
  userId: string,
) {
  return generateToken({ type: 'email-verification', userId }, secret);
}

export async function verifyEmailVerificationToken(
  secret: Uint8Array,
  token: string,
) {
  const payload = await verifyToken(secret, token);

  return payload;
}

export async function createEmailVerificationOTP(userId: string) {
  const otp = generateOTP();

  const code = `${userId}:${otp}`;
  await createOTP(userId, code, OTP_TYPE_EMAIL_VERIFICATION);

  return otp;
}

export function verifyEmailVerificationOTP(userId: string, otp: string) {
  const code = `${userId}:${otp}`;
  return verifyOTP(userId, code, OTP_TYPE_EMAIL_VERIFICATION);
}

export function useUserVerification(event: H3Event) {
  return {
    generateLink: async (userId: string) => {
      const jwtSecret = await useJwtSecret(event);
      const token = await generateEmailVerificationToken(jwtSecret, userId);

      const baseUrl = getRequestURL(event).origin;
      return `${baseUrl}/user/verify?token=${token}`;
    },
    generateToken: async (userId: string) => {
      const jwtSecret = await useJwtSecret(event);
      return generateEmailVerificationToken(jwtSecret, userId);
    },
    verifyToken: async (token: string) => {
      const jwtSecret = await useJwtSecret(event);
      return verifyEmailVerificationToken(jwtSecret, token);
    },
  };
}

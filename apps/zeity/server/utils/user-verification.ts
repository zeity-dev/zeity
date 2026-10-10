import { randomInt } from 'node:crypto';
import { type RequestEvent, getRequestURL } from 'nuxt/server';

import { users } from '@zeity/database/user';
import { useJwtSecret } from './jwt-secret';
import { generateToken, verifyToken } from './jwt';
import { createOTP, OTP_TYPE_EMAIL_VERIFICATION, verifyOTP } from './auth-otp';
import { eq, useDrizzle } from './drizzle';

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

export function generateEmailVerificationToken(secret: Uint8Array, userId: string) {
  return generateToken({ type: 'email-verification', userId }, secret);
}

export async function verifyEmailVerificationToken(secret: Uint8Array, token: string) {
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

export function useUserVerification(event: RequestEvent) {
  return {
    generateLink: async (userId: string) => {
      const jwtSecret = await useJwtSecret();
      const token = await generateEmailVerificationToken(jwtSecret, userId);

      const baseUrl = getRequestURL(event).origin;
      return `${baseUrl}/user/verify?token=${token}`;
    },
    generateToken: async (userId: string) => {
      const jwtSecret = await useJwtSecret();
      return generateEmailVerificationToken(jwtSecret, userId);
    },
    verifyToken: async (token: string) => {
      const jwtSecret = await useJwtSecret();
      return verifyEmailVerificationToken(jwtSecret, token);
    },
  };
}

import type { H3Event } from 'h3';

import { randomBytes } from 'node:crypto';
import { deleteUsersOTPs, OTP_TYPE_PASSWORD_RESET } from './auth-otp';

export async function findResetRequest(code: string) {
  await deleteExpiredOTPs();

  const resetRequest = await findOTP(code, OTP_TYPE_PASSWORD_RESET);
  return resetRequest;
}

export async function createResetRequest(userId: string) {
  await deleteUsersOTPs(userId, OTP_TYPE_PASSWORD_RESET);
  const code = randomBytes(32).toString('hex');

  await createOTP(userId, code, OTP_TYPE_PASSWORD_RESET);

  return code;
}

export function useUserPasswordReset(event: H3Event) {
  return {
    generateResetLink: async (userId: string) => {
      const token = await createResetRequest(userId);

      const baseUrl = getRequestURL(event).origin;
      return `${baseUrl}/auth/reset-password?token=${token}`;
    },
    findResetRequest,
  };
}

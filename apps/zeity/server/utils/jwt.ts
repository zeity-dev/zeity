import { SignJWT, jwtVerify } from 'jose';

import { JWT_ALGORITHM } from './jwt-secret';

const JWT_ISSUER = 'zeity';

export function generateToken(
  payload: Record<string, unknown>,
  secret: Uint8Array,
  options?: {
    expiresIn?: string | number;
  },
) {
  return new SignJWT(payload)
    .setProtectedHeader({
      alg: JWT_ALGORITHM,
    })
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(options?.expiresIn ?? '1d')
    .sign(secret);
}

export async function verifyToken(secret: Uint8Array, token: string) {
  const { payload } = await jwtVerify(token, secret, {
    issuer: JWT_ISSUER,
    algorithms: [JWT_ALGORITHM],
  });

  return payload;
}

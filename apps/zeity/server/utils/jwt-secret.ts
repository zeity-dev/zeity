import { useRuntimeConfig } from 'nuxt/server';

export const JWT_ALGORITHM = 'HS256';

export async function useJwtSecret() {
  const secret = useRuntimeConfig().jwtSecret;
  return new TextEncoder().encode(secret);
}

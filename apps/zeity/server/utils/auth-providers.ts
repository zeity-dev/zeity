export const PASSWORD_PROVIDER_ID = 'password';
export const APPLE_PROVIDER_ID = 'apple';
export const GOOGLE_PROVIDER_ID = 'google';
export const MICROSOFT_PROVIDER_ID = 'microsoft';

export const AUTH_PROVIDERS = [
  PASSWORD_PROVIDER_ID,
  APPLE_PROVIDER_ID,
  GOOGLE_PROVIDER_ID,
  MICROSOFT_PROVIDER_ID,
] as const;

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

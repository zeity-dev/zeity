import { type RequestEvent, getCookie, setCookie, createError } from 'nuxt/server';

const ORGANISATION_COOKIE_NAME = 'organisation';

export function useOrganisationSession(event: RequestEvent) {
  const value = getCookie(event, ORGANISATION_COOKIE_NAME);

  return {
    value,
    setValue: (value: string) => {
      setCookie(event, ORGANISATION_COOKIE_NAME, value);
    },
  };
}

export function requireOrganisationSession(event: RequestEvent) {
  const session = useOrganisationSession(event);

  if (!session.value) {
    throw createError({
      status: 400,
      message: 'Organisation not set',
    });
  }

  return {
    ...session,
    value: session.value,
  };
}

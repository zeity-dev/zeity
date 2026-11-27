import { navigateTo, useCookie } from '#app';

const STORAGE_KEY = 'zeity_redirect';

export function useAuthRedirect() {
  return {
    has() {
      return Boolean(useCookie(STORAGE_KEY).value);
    },
    set(path: string) {
      useCookie(STORAGE_KEY).value = path;
    },
    redirect() {
      const path = useCookie(STORAGE_KEY).value;
      if (path) {
        useCookie(STORAGE_KEY).value = null;
        return navigateTo(path);
      }
    },
  };
}

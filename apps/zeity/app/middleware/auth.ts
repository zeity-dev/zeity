import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useUserSession } from '#imports';
import { useAuthRedirect } from '~/composables/useAuthRedirect';

export default defineNuxtRouteMiddleware(to => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    useAuthRedirect().set(to.fullPath);
    return navigateTo('/auth');
  }
});

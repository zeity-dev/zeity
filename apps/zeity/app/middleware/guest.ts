import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useUserSession } from '#imports';

export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession();

  if (loggedIn.value) {
    return navigateTo('/user');
  }
});

export default defineNuxtRouteMiddleware((to) => {
  // skip on server side
  if (import.meta.server) return;

  if (to.path === '/') {
    return navigateTo('/time');
  }
});

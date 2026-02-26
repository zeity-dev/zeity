export default defineEventHandler(async event => {
  const session = await getUserSession(event);
  if (!session.user?.id) {
    return;
  }

  await refreshUserSession(event);
});

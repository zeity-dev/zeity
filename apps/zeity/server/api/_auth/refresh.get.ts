export default defineEventHandler(async event => {
  const session = await requireUserSession(event);
  if (!session.user?.id) {
    return;
  }

  await refreshUserSession(event);
});

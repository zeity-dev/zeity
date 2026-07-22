import { eq } from '@zeity/database';
import { userSettings } from '@zeity/database/user-settings';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);

  const db = useDrizzle();

  const settings = await db
    .select({
      id: userSettings.id,

      locale: userSettings.locale,
      openTimeDetailsOnStart: userSettings.openTimeDetailsOnStart,
      openTimeDetailsOnStop: userSettings.openTimeDetailsOnStop,
      calculateBreaks: userSettings.calculateBreaks,
      roundTimes: userSettings.roundTimes,
      themeMode: userSettings.themeMode,
      themeColor: userSettings.themeColor,

      organisationId: userSettings.organisationId,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, session.user.id));

  return settings;
});

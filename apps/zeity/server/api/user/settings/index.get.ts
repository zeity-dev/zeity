import { and, eq } from '@zeity/database';
import { userSettings } from '@zeity/database/user-settings';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

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
    .where(
      and(
        eq(userSettings.userId, session.user.id),
        eq(userSettings.organisationId, organisation.value),
      ),
    )
    .limit(1)
    .then(rows => rows[0]);

  if (!settings) {
    db.insert(userSettings)
      .values({
        userId: session.user.id,
        organisationId: organisation.value,
      })
      .returning()
      .then(rows => rows[0]);
  }

  return settings;
});

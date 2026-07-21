import { eq } from '@zeity/database';
import { users } from '@zeity/database/user';
import { organisations } from '@zeity/database/organisation';
import { organisationMembers } from '@zeity/database/organisation-member';
import { userAccounts } from '@zeity/database/user-account';
import { userSettings } from '@zeity/database/user-settings';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);

  const db = useDrizzle();
  const user = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      email: users.email,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
    .then(rows => rows[0])
    .then(user => ({
      ...user,
      emailVerified: Boolean(user?.emailVerified),
    }));

  if (!user?.id) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    });
  }

  const [providers, orgs, settings] = await Promise.all([
    // providers
    db
      .select({
        providerId: userAccounts.providerId,
      })
      .from(userAccounts)
      .where(eq(userAccounts.userId, user.id))
      .then(rows => rows.map(row => row.providerId)),

    // organizations
    db
      .select({
        id: organisations.id,
        name: organisations.name,
        image: organisations.image,
        member: {
          id: organisationMembers.id,
          role: organisationMembers.role,
        },
      })
      .from(organisations)
      .leftJoin(organisationMembers, eq(organisationMembers.organisationId, organisations.id))
      .where(eq(organisationMembers.userId, user.id))
      .orderBy(asc(organisations.name)),

    // user settings
    db
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
      .where(eq(userSettings.userId, user.id)),
  ]);

  return {
    user,
    providers,
    organisations: orgs,
    settings,
  };
});

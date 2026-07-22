import { z } from 'zod';

import { and, eq } from '@zeity/database';
import { userSettings } from '@zeity/database/user-settings';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
    }).safeParse,
  );
  if (!params.success) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  const body = await readValidatedBody(
    event,
    z
      .object({
        locale: z.string().optional(),
        openTimeDetailsOnStart: z.boolean().optional(),
        openTimeDetailsOnStop: z.boolean().optional(),
        calculateBreaks: z.boolean().optional(),
        roundTimes: z.boolean().optional(),
        themeMode: z.string().optional(),
        themeColor: z.string().optional(),
      })
      .partial().safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      statusCode: 400,
      message: 'Invalid request body',
    });
  }

  if (
    !(await userIdBelongsToOrganisation(session.user.id, {
      id: params.data.orgId,
    }))
  ) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const settings = await useDrizzle()
    .insert(userSettings)
    .values({ ...body.data, userId: session.user.id, organisationId: params.data.orgId })
    .onConflictDoUpdate({
      target: [userSettings.userId, userSettings.organisationId],
      set: body.data,
      setWhere: and(
        eq(userSettings.userId, session.user.id),
        eq(userSettings.organisationId, params.data.orgId),
      ),
    })
    .returning({
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
    .then(rows => rows[0]);

  return settings;
});

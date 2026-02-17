import { z } from 'zod';

import { eq } from '@zeity/database';
import { times } from '@zeity/database/time';
import { findTimeById } from '~~/server/utils/time';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: z.uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  const existing = await findTimeById(params.data.id);
  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  const organisationMemberId = await getOrganisationMemberByUserId(
    organisation.value,
    session.user.id,
  ).then((member) => member?.id);

  if (existing.organisationMemberId !== organisationMemberId) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  await useDrizzle()
    .delete(times)
    .where(eq(times.id, params.data.id))
    .returning();

  return sendNoContent(event);
});

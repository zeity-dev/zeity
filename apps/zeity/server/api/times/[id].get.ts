import { createError, defineHandler } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { getOrganisationMemberByUserId } from '#server/utils/organisation';
import { requireOrganisationSession } from '#server/utils/organisation-session';
import { getSafeRouterParams } from '#server/utils/zod';
import { findTimeById } from '~~/server/utils/time';

export default defineHandler(async event => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const params = await getSafeRouterParams(
    event,
    z.object({
      id: z.uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  const result = await findTimeById(params.data.id);
  if (!result) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  const organisationMemberId = await getOrganisationMemberByUserId(
    organisation.value,
    session.user.id,
  ).then(member => member?.id);

  if (
    result.organisationId !== organisation.value ||
    result.organisationMemberId !== organisationMemberId
  ) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  return result;
});

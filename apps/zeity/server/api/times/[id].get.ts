import { z } from 'zod';

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

  const result = await findTimeById(params.data.id);
  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  const organisationMemberId = await getOrganisationMemberByUserId(
    organisation.value,
    session.user.id,
  ).then((member) => member?.id);

  if (result.organisationMemberId !== organisationMemberId) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  return result;
});

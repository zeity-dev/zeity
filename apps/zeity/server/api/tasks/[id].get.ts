import { z } from 'zod';

import { findTaskById } from '~~/server/utils/task';
import { userIdBelongsToOrganisation } from '~~/server/utils/organisation-permission';

export default defineEventHandler(async event => {
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

  const result = await findTaskById(params.data.id);
  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  if (
    !(await userIdBelongsToOrganisation(session.user.id, {
      id: organisation.value,
    }))
  ) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  return result;
});

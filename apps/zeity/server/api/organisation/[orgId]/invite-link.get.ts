import { z } from 'zod';

import { generateToken } from '~~/server/utils/jwt';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      orgId: z.string().uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  if (
    !(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))
  ) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const token = await generateToken(
    {
      type: 'organisation-invite',
      organisationId: params.data.orgId,
    },
    await useJwtSecret(event),
    { expiresIn: '7d' },
  );

  const link = new URL(`${getRequestURL(event).origin}/organisations/join`);
  link.searchParams.set('token', token);

  return link.toString();
});

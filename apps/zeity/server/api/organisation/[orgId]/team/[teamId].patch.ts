import { z } from 'zod';

import { eq, and } from '@zeity/database';
import { organisationTeams } from '@zeity/database/organisation-team';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
      teamId: z.uuid(),
    }).safeParse,
  );
  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  const body = await readValidatedBody(
    event,
    z
      .object({
        name: z.string().trim().min(2).max(150),
        description: z.string().trim().optional(),
        permissions: z.array(z.string()).optional().default([]),
      })
      .partial().safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      status: 400,
      message: 'Invalid request body',
    });
  }

  if (!(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  const result = await useDrizzle()
    .update(organisationTeams)
    .set(body.data)
    .where(
      and(
        eq(organisationTeams.organisationId, params.data.orgId),
        eq(organisationTeams.id, params.data.teamId),
      ),
    )
    .returning()
    .then(res => res[0]);

  return result;
});

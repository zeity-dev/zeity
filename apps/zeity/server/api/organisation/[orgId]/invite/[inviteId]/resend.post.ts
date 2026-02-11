import { z } from 'zod';

import { organisations } from '@zeity/database/organisation';
import { organisationInvites } from '@zeity/database/organisation-invite';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';
import { sendInviteMail } from '~~/server/utils/user-invite';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
      inviteId: z.uuid(),
    }).safeParse
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

  const { organisation, organisation_invite } = await useDrizzle()
    .select()
    .from(organisationInvites)
    .leftJoin(
      organisations,
      eq(organisations.id, organisationInvites.organisationId)
    )
    .where(eq(organisationInvites.id, params.data.inviteId))
    .limit(1)
    .then((res) => res[0] || { organisation: null, organisation_invite: null });

  if (!organisation || !organisation_invite) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  await sendInviteMail(event, organisation, organisation_invite);

  return { success: true };
});

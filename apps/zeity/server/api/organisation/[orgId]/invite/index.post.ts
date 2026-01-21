import { z } from 'zod';

import { organisations } from '@zeity/database/organisation';
import { organisationInvites } from '@zeity/database/organisation-invite';

import { sendInviteMail } from '~~/server/utils/user-invite';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';
import { checkOrganisationMembersQuota } from '~~/server/utils/organisation-quota';

export default defineEventHandler(async (event) => {
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
    z.object({
      email: z.email(),
    }).safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      statusCode: 400,
      message: 'Invalid request body',
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

  if ((await checkOrganisationMembersQuota(params.data.orgId)) === false) {
    throw createError({
      statusCode: 403,
      message: 'User quota exceeded',
    });
  }

  const db = useDrizzle();
  const organisation = await db
    .select()
    .from(organisations)
    .where(eq(organisations.id, params.data.orgId))
    .limit(1)
    .then((res) => res[0]);

  const result = await db
    .insert(organisationInvites)
    .values({
      email: body.data.email,
      organisationId: params.data.orgId,
    })
    .returning()
    .then((res) => res[0]);

  if (!organisation || !result) {
    throw createError({
      statusCode: 400,
      message: 'Not found',
    });
  }

  await sendInviteMail(event, organisation, result);

  return result;
});

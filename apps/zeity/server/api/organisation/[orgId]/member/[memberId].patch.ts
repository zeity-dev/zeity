import { z } from 'zod';

import { ORGANISATION_MEMBER_ROLES } from '@zeity/types/organisation';
import { organisationMembers } from '@zeity/database/organisation-member';
import { countOrganisationMemberOwner } from '~~/server/utils/organisation';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
      memberId: z.uuid(),
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
        role: z.enum(ORGANISATION_MEMBER_ROLES),
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
    !(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))
  ) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const result = await useDrizzle().transaction(async (tx) => {
    const txResult = await tx
      .update(organisationMembers)
      .set(body.data)
      .where(
        and(
          eq(organisationMembers.organisationId, params.data.orgId),
          eq(organisationMembers.id, params.data.memberId),
        ),
      );

    // check if organisation has at least one owner
    const ownerCount = await countOrganisationMemberOwner(
      params.data.orgId,
      tx,
    );

    if (ownerCount < 1) {
      throw createError({
        statusCode: 400,
        message: 'Organisation must have at least one owner',
      });
    }

    return txResult;
  });

  return result;
});

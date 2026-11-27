import { createError, defineHandler } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { and, eq, useDrizzle } from '#server/utils/drizzle';
import { hasUserOrganisationMemberRole } from '#server/utils/organisation';
import { getSafeRouterParams } from '#server/utils/zod';
import { organisationMembers } from '@zeity/database/organisation-member';
import { ORGANISATION_MEMBER_ROLE_OWNER } from '@zeity/types/organisation';
import { countOrganisationMemberOwner } from '~~/server/utils/organisation';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getSafeRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
      memberId: z.uuid(),
    }).safeParse,
  );
  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  if (!(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  if (
    await hasUserOrganisationMemberRole(
      { organisationId: params.data.orgId, memberId: params.data.memberId },
      [ORGANISATION_MEMBER_ROLE_OWNER],
    )
  ) {
    throw createError({
      status: 400,
      message: 'Can not delete owner',
    });
  }

  await useDrizzle().transaction(async tx => {
    await tx
      .delete(organisationMembers)
      .where(
        and(
          eq(organisationMembers.organisationId, params.data.orgId),
          eq(organisationMembers.id, params.data.memberId),
        ),
      );

    // check if organisation has at least one owner
    const ownerCount = await countOrganisationMemberOwner(params.data.orgId, tx);

    if (ownerCount < 1) {
      // rollback transaction
      tx.rollback();
      throw createError({
        status: 400,
        message: 'Organisation must have at least one owner',
      });
    }
  });

  return new Response(null, { status: 204 });
});

import { createError, defineHandler } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { requireOrganisationSession } from '#server/utils/organisation-session';
import { getSafeRouterParams } from '#server/utils/zod';
import { and, eq } from '@zeity/database';
import { taskAssignments } from '@zeity/database/task-assignment';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';
import { doesTasksBelongToOrganisation } from '~~/server/utils/task';

export default defineHandler(async event => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const params = await getSafeRouterParams(
    event,
    z.object({
      id: z.uuid(),
      memberId: z.uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  if (!(await canUserUpdateOrganisationByOrgId(session.user, organisation.value))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  const belongsToOrg = await doesTasksBelongToOrganisation(params.data.id, organisation.value);
  if (!belongsToOrg) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  await useDrizzle()
    .delete(taskAssignments)
    .where(
      and(
        eq(taskAssignments.taskId, params.data.id),
        eq(taskAssignments.organisationMemberId, params.data.memberId),
      ),
    );

  return new Response(null, { status: 204 });
});

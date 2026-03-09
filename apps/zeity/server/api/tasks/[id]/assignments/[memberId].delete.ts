import { z } from 'zod';

import { eq, and } from '@zeity/database';
import { taskAssignments } from '@zeity/database/task-assignment';
import { doesTaskBelongToOrganisation } from '~~/server/utils/task';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: z.uuid(),
      memberId: z.uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  if (!(await canUserUpdateOrganisationByOrgId(session.user, organisation.value))) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const belongsToOrg = await doesTaskBelongToOrganisation(params.data.id, organisation.value);
  if (!belongsToOrg) {
    throw createError({
      statusCode: 404,
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

  return sendNoContent(event);
});

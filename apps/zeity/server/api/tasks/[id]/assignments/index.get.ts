import { z } from 'zod';

import { eq } from '@zeity/database';
import { taskAssignments } from '@zeity/database/task-assignment';
import { organisationMembers } from '@zeity/database/organisation-member';
import { users } from '@zeity/database/user';
import { doesTaskBelongToOrganisation } from '~~/server/utils/task';

export default defineEventHandler(async event => {
  await requireUserSession(event);
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

  const belongsToOrg = await doesTaskBelongToOrganisation(params.data.id, organisation.value);
  if (!belongsToOrg) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  const result = await useDrizzle()
    .select({
      taskId: taskAssignments.taskId,
      organisationMemberId: taskAssignments.organisationMemberId,
      createdAt: taskAssignments.createdAt,
      member: {
        id: organisationMembers.id,
        role: organisationMembers.role,
        userId: organisationMembers.userId,
      },
      user: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
    })
    .from(taskAssignments)
    .leftJoin(organisationMembers, eq(taskAssignments.organisationMemberId, organisationMembers.id))
    .leftJoin(users, eq(organisationMembers.userId, users.id))
    .where(eq(taskAssignments.taskId, params.data.id));

  return result;
});

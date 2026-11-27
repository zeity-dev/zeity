import { createError, defineHandler } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { requireOrganisationSession } from '#server/utils/organisation-session';
import { getSafeRouterParams } from '#server/utils/zod';
import { eq } from '@zeity/database';
import { organisationMembers } from '@zeity/database/organisation-member';
import { taskAssignments } from '@zeity/database/task-assignment';
import { users } from '@zeity/database/user';
import { userIdBelongsToOrganisation } from '~~/server/utils/organisation-permission';
import { doesTasksBelongToOrganisation } from '~~/server/utils/task';

export default defineHandler(async event => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const params = await getSafeRouterParams(
    event,
    z.object({
      id: z.uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  if (!(await userIdBelongsToOrganisation(session.user.id, { id: organisation.value }))) {
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

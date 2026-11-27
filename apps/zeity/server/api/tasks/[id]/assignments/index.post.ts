import { createError, defineHandler, readValidatedBody } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { requireOrganisationSession } from '#server/utils/organisation-session';
import { getSafeRouterParams } from '#server/utils/zod';
import { and, eq } from '@zeity/database';
import { organisationMembers } from '@zeity/database/organisation-member';
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

  const body = await readValidatedBody(
    event,
    z.object({
      organisationMemberId: z.uuid(),
    }).safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      status: 400,
      message: 'Invalid request body',
    });
  }

  // Verify the member belongs to the same organisation
  const member = await useDrizzle()
    .select({ id: organisationMembers.id })
    .from(organisationMembers)
    .where(
      and(
        eq(organisationMembers.id, body.data.organisationMemberId),
        eq(organisationMembers.organisationId, organisation.value),
      ),
    )
    .limit(1)
    .then(res => res[0]);

  if (!member) {
    throw createError({
      status: 400,
      message: 'Member does not belong to this organisation',
    });
  }

  const result = await useDrizzle()
    .insert(taskAssignments)
    .values({
      taskId: params.data.id,
      organisationMemberId: body.data.organisationMemberId,
    })
    .onConflictDoNothing()
    .returning()
    .then(data => data[0]);

  if (!result) {
    throw createError({
      status: 409,
      message: 'Assignment already exists',
    });
  }

  return result;
});

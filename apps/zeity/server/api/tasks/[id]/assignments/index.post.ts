import { z } from 'zod';

import { eq, and } from '@zeity/database';
import { taskAssignments } from '@zeity/database/task-assignment';
import { organisationMembers } from '@zeity/database/organisation-member';
import { doesTasksBelongToOrganisation } from '~~/server/utils/task';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);
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

  if (!(await canUserUpdateOrganisationByOrgId(session.user, organisation.value))) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const belongsToOrg = await doesTasksBelongToOrganisation(params.data.id, organisation.value);
  if (!belongsToOrg) {
    throw createError({
      statusCode: 404,
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
      statusCode: 400,
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
      statusCode: 400,
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
      statusCode: 409,
      message: 'Assignment already exists',
    });
  }

  return result;
});

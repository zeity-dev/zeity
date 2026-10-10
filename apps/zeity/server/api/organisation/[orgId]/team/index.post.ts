import { z } from 'zod';

import { eq, and, inArray } from '@zeity/database';
import { organisationTeams } from '@zeity/database/organisation-team';
import { organisationMembers } from '@zeity/database/organisation-member';
import { organisationTeamMembers } from '@zeity/database/organisation-team-member';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
    }).safeParse,
  );
  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  const body = await readValidatedBody(
    event,
    z.object({
      name: z.string().trim().min(2).max(150),
      description: z.string().trim().optional(),
      permissions: z.array(z.string()).optional().default([]),
      memberIds: z.array(z.uuid()).optional().default([]),
    }).safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      status: 400,
      message: 'Invalid request body',
    });
  }

  if (!(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  const result = await useDrizzle().transaction(async tx => {
    // create organisation team
    const team = await tx
      .insert(organisationTeams)
      .values({
        ...body.data,
        organisationId: params.data.orgId,
      })
      .returning()
      .then(res => res[0]);

    if (!team) {
      throw createError({
        status: 500,
        message: 'Failed to create organisation team',
      });
    }

    // check if members exist in the organisation
    const existingMembers = await tx
      .select({ id: organisationMembers.id })
      .from(organisationMembers)
      .where(
        and(
          eq(organisationMembers.organisationId, params.data.orgId),
          inArray(organisationMembers.id, body.data.memberIds),
        ),
      );

    if (existingMembers.length) {
      // Insert team members
      await tx.insert(organisationTeamMembers).values(
        existingMembers.map(({ id }) => ({
          memberId: id,
          teamId: team.id,
        })),
      );
    }

    return team;
  });

  return result;
});

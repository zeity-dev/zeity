import { z } from 'zod';

import { eq, asc, ilike } from '@zeity/database';
import { users } from '@zeity/database/user';
import { organisationMembers } from '@zeity/database/organisation-member';
import { organisationTeamMembers } from '@zeity/database/organisation-team-member';
import { canUserReadOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
      teamId: z.uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  const query = await getValidatedQuery(
    event,
    z.object({
      search: z.string().optional(),

      offset: z.coerce.number().int().nonnegative().default(0),
      limit: z.coerce.number().int().positive().lte(500).default(40),
    }).safeParse,
  );

  if (!query.success) {
    throw createError({
      data: query.error,
      status: 400,
      message: 'Invalid request queries',
    });
  }

  if (!(await canUserReadOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  const whereStatements = [eq(organisationTeamMembers.teamId, params.data.teamId)];

  if (query.data.search) {
    whereStatements.push(ilike(users.name, `%${query.data.search}%`));
  }

  const members = await useDrizzle()
    .select({
      memberId: organisationMembers.id,
      userId: organisationMembers.userId,
      role: organisationMembers.role,
      user: users,
    })
    .from(organisationMembers)
    .leftJoin(users, eq(organisationMembers.userId, users.id))
    .leftJoin(organisationTeamMembers, eq(organisationTeamMembers.memberId, organisationMembers.id))
    .where(and(...whereStatements))
    .orderBy(asc(users.name))
    .offset(query.data.offset)
    .limit(query.data.limit);

  return members;
});

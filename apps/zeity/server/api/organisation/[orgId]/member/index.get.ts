import { z } from 'zod';

import { eq, asc, ilike, inArray, notInArray, count } from '@zeity/database';
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
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  const query = await getValidatedQuery(
    event,
    z.object({
      search: z.string().optional(),
      team: coerceArray(z.uuid()).optional(),
      excludeTeam: coerceArray(z.uuid()).optional(),

      sortingColumn: z.string().default('name'),
      sortingOrder: z.enum(['asc', 'desc']).default('asc'),

      offset: z.coerce.number().int().nonnegative().default(0),
      limit: z.coerce.number().int().positive().lte(500).default(40),
    }).safeParse,
  );

  if (!query.success) {
    throw createError({
      data: query.error,
      statusCode: 400,
      message: 'Invalid request queries',
    });
  }

  if (!(await canUserReadOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const whereStatements = [eq(organisationMembers.organisationId, params.data.orgId)];

  if (query.data.search) {
    whereStatements.push(ilike(users.name, `%${query.data.search}%`));
  }

  if (query.data.team) {
    // find member ids in teams
    const memberIds = await getMemberIdsInTeams(query.data.team);

    // filter members found in teams
    whereStatements.push(inArray(organisationMembers.id, memberIds));
  }
  if (query.data.excludeTeam) {
    // find member ids in teams
    const memberIds = await getMemberIdsInTeams(query.data.excludeTeam);

    // filter out members found in excluded teams
    whereStatements.push(notInArray(organisationMembers.id, memberIds));
  }

  const db = useDrizzle();
  const [total, items] = await Promise.all([
    db
      .select({
        count: count(),
      })
      .from(organisationMembers)
      .leftJoin(users, eq(users.id, organisationMembers.userId))
      .where(and(...whereStatements))
      .then(rows => rows[0]?.count || 0),

    db
      .select({
        id: organisationMembers.id,
        userId: organisationMembers.userId,
        organisationId: organisationMembers.organisationId,

        role: organisationMembers.role,
        user: users,
      })
      .from(organisationMembers)
      .leftJoin(users, eq(users.id, organisationMembers.userId))
      .where(and(...whereStatements))
      .orderBy(prepareSorting(query.data.sortingColumn, query.data.sortingOrder))
      .offset(query.data.offset)
      .limit(query.data.limit),
  ]);

  return { items, total };
});

function prepareSorting(column: string, direction = 'asc') {
  const dir = direction === 'asc' ? asc : desc;
  switch (column) {
    case 'name':
      return dir(users.name);
    case 'role':
      return dir(organisationMembers.role);
    case 'createdAt':
      return dir(organisationMembers.createdAt);
    default:
      return dir(users.name);
  }
}

async function getMemberIdsInTeams(teamIds: string[]) {
  if (teamIds.length === 0) {
    return [];
  }

  const memberIds = await useDrizzle()
    .select({
      memberId: organisationTeamMembers.memberId,
    })
    .from(organisationTeamMembers)
    .where(inArray(organisationTeamMembers.teamId, teamIds))
    .then(rows => rows.map(row => row.memberId));

  return memberIds;
}

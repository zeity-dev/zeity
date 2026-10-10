import { createError, defineEventHandler, getValidatedQuery } from 'nuxt/server';
import { z } from 'zod';

import { eq, asc, sql } from '@zeity/database';
import { organisations } from '@zeity/database/organisation';
import { organisationTeams } from '@zeity/database/organisation-team';
import { organisationMembers } from '@zeity/database/organisation-member';
import { useDrizzle } from '~~/server/utils/drizzle';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);

  const query = await getValidatedQuery(
    event,
    z.object({
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

  const db = useDrizzle();

  const membersCountSubquery = db
    .select({
      organisationId: organisationMembers.organisationId,
      counter: sql<number>`count(*)`.mapWith(Number).as('members_count'),
    })
    .from(organisationMembers)
    .groupBy(organisationMembers.organisationId)
    .as('members_count');

  const teamsCountSubquery = db
    .select({
      organisationId: organisationTeams.organisationId,
      counter: sql<number>`count(*)`.mapWith(Number).as('teams_count'),
    })
    .from(organisationTeams)
    .groupBy(organisationTeams.organisationId)
    .as('teams_count');

  const result = await db
    .select({
      id: organisations.id,
      name: organisations.name,
      image: organisations.image,
      stats: {
        members: membersCountSubquery.counter,
        teams: teamsCountSubquery.counter,
      },
    })
    .from(organisations)
    .leftJoin(organisationMembers, eq(organisationMembers.organisationId, organisations.id))
    .leftJoin(membersCountSubquery, eq(membersCountSubquery.organisationId, organisations.id))
    .leftJoin(teamsCountSubquery, eq(teamsCountSubquery.organisationId, organisations.id))
    .where(eq(organisationMembers.userId, session.user.id))
    .orderBy(asc(organisations.name));

  return result;
});

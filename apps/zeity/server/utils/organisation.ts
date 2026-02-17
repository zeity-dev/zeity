import type { H3Event } from 'h3';
import z from 'zod';

import { count, inArray, isNotNull } from '@zeity/database';
import { organisations } from '@zeity/database/organisation';
import { organisationTeams } from '@zeity/database/organisation-team';
import { organisationTeamMembers } from '@zeity/database/organisation-team-member';
import { organisationMembers } from '@zeity/database/organisation-member';

import type { OrganisationMemberRole } from '@zeity/types/organisation';
import { ORGANISATION_MEMBER_ROLE_OWNER } from '@zeity/types/organisation';
import { nonEmptyString } from './zod';

export function doesOrganisationExist(organisationId: string) {
  return useDrizzle()
    .select({ id: organisations.id })
    .from(organisations)
    .where(eq(organisations.id, organisationId))
    .limit(1)
    .then((res) => res[0]?.id === organisationId);
}

export function hasUserOrganisationMemberRole(
  options:
    | {
        organisationId: string;
        userId: string;
      }
    | {
        organisationId: string;
        memberId: string;
      },
  roles: OrganisationMemberRole[] = [ORGANISATION_MEMBER_ROLE_OWNER],
) {
  const where = [
    eq(organisationMembers.organisationId, options.organisationId),
  ];

  if ('userId' in options) {
    where.push(eq(organisationMembers.userId, options.userId));
  } else if ('memberId' in options) {
    where.push(eq(organisationMembers.id, options.memberId));
  } else {
    throw new Error('Either userId or memberId must be provided');
  }

  return useDrizzle()
    .select()
    .from(organisationMembers)
    .where(and(...where, inArray(organisationMembers.role, roles)))
    .then((res) => res.length > 0);
}

export function getOrganisationMemberByUserId(
  organisationId: string,
  userId: string,
) {
  return useDrizzle()
    .select()
    .from(organisationMembers)
    .where(
      and(
        eq(organisationMembers.userId, userId),
        eq(organisationMembers.organisationId, organisationId),
      ),
    )
    .limit(1)
    .then((res) => res[0]);
}

export function getOrganisationMembersByUserIds(
  organisationId: string,
  userIds: string[],
) {
  return useDrizzle()
    .select()
    .from(organisationMembers)
    .where(
      and(
        inArray(organisationMembers.userId, userIds),
        eq(organisationMembers.organisationId, organisationId),
      ),
    );
}

export function getOrganisationMembersByMemberIds(
  organisationId: string,
  memberIds: string[],
) {
  return useDrizzle()
    .select()
    .from(organisationMembers)
    .where(
      and(
        inArray(organisationMembers.id, memberIds),
        eq(organisationMembers.organisationId, organisationId),
      ),
    );
}

export function countOrganisationMemberOwner(
  organisationId: string,
  tx?: unknown,
): Promise<number> {
  const db = (tx as ReturnType<typeof useDrizzle>) ?? useDrizzle();
  return db
    .select({ count: count() })
    .from(organisationMembers)
    .where(
      and(
        eq(organisationMembers.organisationId, organisationId),
        eq(organisationMembers.role, ORGANISATION_MEMBER_ROLE_OWNER),
        isNotNull(organisationMembers.userId),
      ),
    )
    .then((res) => res[0]?.count ?? 0);
}

export function getOrganisationTeamsByOrgId(organisationId: string) {
  const db = useDrizzle();
  const membersCountSubquery = db
    .select({
      teamId: organisationTeamMembers.teamId,
      counter: sql<number>`count(*)`.mapWith(Number).as('members_count'),
    })
    .from(organisationTeamMembers)
    .groupBy(organisationTeamMembers.teamId)
    .as('members_count');

  return db
    .select({
      id: organisationTeams.id,
      name: organisationTeams.name,
      description: organisationTeams.description,
      memberCount: membersCountSubquery.counter,
    })
    .from(organisationTeams)
    .leftJoin(
      membersCountSubquery,
      eq(membersCountSubquery.teamId, organisationTeams.id),
    )
    .where(eq(organisationTeams.organisationId, organisationId));
}

const schemaQuota = z
  .object({
    members: nonEmptyString(z.coerce.number().int()),
  })
  .partial();

export function getDefaultOrganisationQuota(event: H3Event) {
  const quota = useRuntimeConfig(event).organisation?.quota;
  const parsed = schemaQuota.safeParse(quota);
  if (parsed.success) {
    return parsed.data;
  }
  return {};
}

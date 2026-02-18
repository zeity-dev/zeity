import { z } from 'zod';

import { count, eq } from '@zeity/database';
import { organisations } from '@zeity/database/organisation';
import { organisationMembers } from '@zeity/database/organisation-member';
import { organisationInvites } from '@zeity/database/organisation-invite';
import { organisationJoinRequests } from '@zeity/database/organisation-join-request';
import { JOIN_REQUEST_STATUS_PENDING } from '@zeity/types';

export default defineEventHandler(async (event) => {
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

  if (
    !(await canUserReadOrganisationByOrgId(session.user, params.data.orgId))
  ) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const db = useDrizzle();

  const membersCountSubquery = db
    .select({
      organisationId: organisationMembers.organisationId,
      counter: count().as('members_count'),
    })
    .from(organisationMembers)
    .groupBy(organisationMembers.organisationId)
    .as('members_count');

  const invitesCountSubquery = db
    .select({
      organisationId: organisationInvites.organisationId,
      counter: count().as('invites_count'),
    })
    .from(organisationInvites)
    .groupBy(organisationInvites.organisationId)
    .as('invites_count');

  const joinRequestsCountSubquery = db
    .select({
      organisationId: organisationJoinRequests.organisationId,
      counter: count().as('joinRequests_count'),
    })
    .from(organisationJoinRequests)
    .groupBy(organisationJoinRequests.organisationId)
    .where(eq(organisationJoinRequests.status, JOIN_REQUEST_STATUS_PENDING))
    .as('joinRequests_count');

  const result = await useDrizzle()
    .select({
      id: organisations.id,
      name: organisations.name,
      image: organisations.image,
      quota: organisations.quota,

      stats: {
        members: membersCountSubquery.counter,
        invites: invitesCountSubquery.counter,
        joinRequests: joinRequestsCountSubquery.counter,
      },
    })
    .from(organisations)
    .leftJoin(
      membersCountSubquery,
      eq(organisations.id, membersCountSubquery.organisationId),
    )
    .leftJoin(
      invitesCountSubquery,
      eq(organisations.id, invitesCountSubquery.organisationId),
    )
    .leftJoin(
      joinRequestsCountSubquery,
      eq(organisations.id, joinRequestsCountSubquery.organisationId),
    )
    .where(eq(organisations.id, params.data.orgId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  return result;
});

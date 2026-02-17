import { z } from 'zod';

import { and, eq, desc, inArray } from '@zeity/database';
import { times } from '@zeity/database/time';
import { coerceArray } from '~~/server/utils/zod';
import { doesProjectsBelongsToOrganisation } from '~~/server/utils/project';
import { getOrganisationMembersByMemberIds } from '~~/server/utils/organisation';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const query = await getValidatedQuery(
    event,
    z.object({
      offset: z.coerce.number().int().nonnegative().default(0),
      limit: z.coerce.number().int().positive().lte(500).default(40),

      organisationMemberId: coerceArray(z.uuid()).optional(),
      projectId: coerceArray(z.uuid()).optional(),
      rangeStart: z.coerce.date().optional(),
      rangeEnd: z.coerce.date().optional(),
    }).safeParse,
  );

  if (!query.success) {
    throw createError({
      data: query.error,
      statusCode: 400,
      message: 'Invalid request queries',
    });
  }

  const whereStatements = [eq(times.organisationId, organisation.value)];

  if (query.data.organisationMemberId) {
    const organisationMemberIds = await getOrganisationMembersByMemberIds(
      organisation.value,
      query.data.organisationMemberId,
    ).then((members) => members.map((member) => member.id));

    // check if all organisationMemberIds belongs to the organisation
    if (
      organisationMemberIds.length !== query.data.organisationMemberId.length
    ) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden',
      });
    }

    whereStatements.push(
      inArray(times.organisationMemberId, organisationMemberIds),
    );
  } else {
    const organisationMemberId = await getOrganisationMemberByUserId(
      organisation.value,
      session.user.id,
    ).then((member) => member?.id || null);

    if (!organisationMemberId) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden',
      });
    }

    whereStatements.push(eq(times.organisationMemberId, organisationMemberId));
  }

  if (query.data.projectId) {
    // check if the project belongs to the organisation
    const isOrganisationProject = await doesProjectsBelongsToOrganisation(
      query.data.projectId,
      organisation.value,
    );
    if (!isOrganisationProject) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden',
      });
    }

    whereStatements.push(inArray(times.projectId, query.data.projectId));
  }

  // date range
  if (query.data.rangeStart) {
    whereStatements.push(gte(times.start, query.data.rangeStart));
  }
  if (query.data.rangeEnd) {
    whereStatements.push(lte(times.start, query.data.rangeEnd));
  }

  const result = await useDrizzle()
    .select()
    .from(times)
    .where(and(...whereStatements))
    .orderBy(desc(times.start))
    .limit(query.data.limit)
    .offset(query.data.offset);

  return result;
});

import { z } from 'zod';

import { PROJECT_STATUSES } from '@zeity/types';
import { eq, desc, ilike, inArray } from '@zeity/database';
import { projects } from '@zeity/database/project';
import { coerceArray } from '~~/server/utils/zod';

export default defineEventHandler(async event => {
  await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const query = await getValidatedQuery(
    event,
    z.object({
      offset: z.coerce.number().int().nonnegative().default(0),
      limit: z.coerce.number().int().positive().lte(500).default(40),
      sort: z.enum(['name', 'createdAt']).default('name'),
      search: z.string().optional(),
      status: coerceArray(z.enum(PROJECT_STATUSES)).optional(),
    }).safeParse,
  );

  if (!query.success) {
    throw createError({
      data: query.error,
      status: 400,
      message: 'Invalid request queries',
    });
  }

  const whereStatements = [eq(projects.organisationId, organisation.value)];

  if (query.data.status) {
    whereStatements.push(inArray(projects.status, query.data.status));
  }

  if (query.data.search) {
    whereStatements.push(ilike(projects.name, `%${query.data.search}%`));
  }

  const result = await useDrizzle()
    .select()
    .from(projects)
    .where(and(...whereStatements))
    .orderBy(desc(projects[query.data.sort]))
    .limit(query.data.limit)
    .offset(query.data.offset);

  return result;
});

import { z } from 'zod';

import { organisations } from '@zeity/database/organisation';
import { organisationMembers } from '@zeity/database/organisation-member';
import { ORGANISATION_MEMBER_ROLE_OWNER } from '@zeity/types/organisation';
import { getDefaultOrganisationQuota } from '~~/server/utils/organisation';

export default defineEventHandler(async (event) => {
  const allowed = useRuntimeConfig(event).public.allow.organisation.create;
  if (!allowed) {
    throw createError({
      statusCode: 403,
      message: 'Organisation creation is disabled',
    });
  }

  const session = await requireUserSession(event);

  const body = await readValidatedBody(
    event,
    z.object({
      name: z.string().trim().min(3).max(150),
    }).safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      statusCode: 400,
      message: 'Invalid request body',
    });
  }

  const defaultQuota = getDefaultOrganisationQuota(event);

  const result = await useDrizzle().transaction(async (tx) => {
    const org = await tx
      .insert(organisations)
      .values({ ...body.data, quota: defaultQuota })
      .returning()
      .then((res) => res[0]);

    if (!org) {
      throw createError({
        statusCode: 500,
        message: 'Failed to create organisation',
      });
    }

    await tx.insert(organisationMembers).values({
      userId: session.user.id,
      organisationId: org.id,
      role: ORGANISATION_MEMBER_ROLE_OWNER,
    });

    return org;
  });

  return result;
});

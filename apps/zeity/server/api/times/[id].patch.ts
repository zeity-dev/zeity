import { z } from 'zod';

import { eq } from '@zeity/database';
import { times } from '@zeity/database/time';
import { TIME_TYPES } from '@zeity/types';
import { findTimeById } from '~~/server/utils/time';
import { doesProjectsBelongsToOrganisation } from '~~/server/utils/project';

export default defineEventHandler(async (event) => {
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

  const body = await readValidatedBody(
    event,
    z
      .object({
        type: z.enum(TIME_TYPES).optional(),
        start: z.coerce.date(),
        duration: z.coerce.number().nonnegative(),
        // tags: z.array(z.number()).optional(),
        projectId: z.uuid().optional(),
        notes: z.string().optional(),
      })
      .partial().safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      statusCode: 400,
      message: 'Invalid request body',
    });
  }

  if (body.data.projectId) {
    const isOrganisationProject = await doesProjectsBelongsToOrganisation(
      body.data.projectId,
      organisation.value,
    );
    if (!isOrganisationProject) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden',
      });
    }
  }

  const existing = await findTimeById(params.data.id);
  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  const organisationMemberId = await getOrganisationMemberByUserId(
    organisation.value,
    session.user.id,
  ).then((member) => member?.id);

  if (existing.organisationMemberId !== organisationMemberId) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const result = await useDrizzle()
    .update(times)
    .set(body.data)
    .where(eq(times.id, params.data.id))
    .returning()
    .then((res) => res[0]);

  return result;
});

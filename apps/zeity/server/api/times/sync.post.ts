import z from 'zod';

import { times } from '@zeity/database/time';
import { TIME_TYPES } from '@zeity/types';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const body = await readValidatedBody(
    event,
    z.array(
      z.object({
        type: z.enum(TIME_TYPES).optional(),
        start: z.coerce.date(),
        duration: z.coerce.number().nonnegative().default(0),
        // tags: z.array(z.number()).optional(),
        projectId: z.uuid().optional(),
        notes: z.string().optional(),
      }),
    ).safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      statusCode: 400,
      message: 'Invalid request body',
    });
  }

  const projectIds = body.data
    .map((time) => time.projectId)
    .filter((id): id is string => !!id);

  if (projectIds.length > 0) {
    const isOrganisationProject = await doesProjectsBelongsToOrganisation(
      projectIds,
      organisation.value,
    );
    if (!isOrganisationProject) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden',
      });
    }
  }

  const organisationMemberId = await getOrganisationMemberByUserId(
    organisation.value,
    session.user.id,
  ).then((member) => member?.id);

  if (!organisationMemberId) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const result = await useDrizzle()
    .insert(times)
    .values(
      body.data.map((time) => ({
        ...time,
        organisationMemberId,
      })),
    )
    .returning();

  return result;
});

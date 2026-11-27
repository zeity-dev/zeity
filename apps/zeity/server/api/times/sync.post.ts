import { createError, defineHandler, readValidatedBody } from 'nuxt/server';
import z from 'zod';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { getOrganisationMemberByUserId } from '#server/utils/organisation';
import { requireOrganisationSession } from '#server/utils/organisation-session';
import { doesProjectsBelongsToOrganisation } from '#server/utils/project';
import { times } from '@zeity/database/time';
import { TIME_TYPES } from '@zeity/types';
import { doesTasksBelongToOrganisation } from '~~/server/utils/task';

export default defineHandler(async event => {
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
        projectId: z.uuid().nullable().optional(),
        taskId: z.uuid().nullable().optional(),
        notes: z.string().optional(),
      }),
    ).safeParse,
  );

  if (!body.success) {
    throw createError({
      data: body.error,
      status: 400,
      message: 'Invalid request body',
    });
  }

  const projectIds = body.data.map(time => time.projectId).filter((id): id is string => !!id);

  if (projectIds.length > 0) {
    const isOrganisationProject = await doesProjectsBelongsToOrganisation(
      projectIds,
      organisation.value,
    );
    if (!isOrganisationProject) {
      throw createError({
        status: 403,
        message: 'Forbidden',
      });
    }
  }

  const taskIds = body.data.map(time => time.taskId).filter((id): id is string => !!id);

  if (taskIds.length > 0) {
    const isOrganisationTask = await doesTasksBelongToOrganisation(taskIds, organisation.value);
    if (!isOrganisationTask) {
      throw createError({
        status: 403,
        message: 'Forbidden',
      });
    }
  }

  const organisationMemberId = await getOrganisationMemberByUserId(
    organisation.value,
    session.user.id,
  ).then(member => member?.id);

  if (!organisationMemberId) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  const result = await useDrizzle()
    .insert(times)
    .values(
      body.data.map(time => ({
        ...time,
        organisationId: organisation.value,
        organisationMemberId,
      })),
    )
    .returning();

  return result;
});

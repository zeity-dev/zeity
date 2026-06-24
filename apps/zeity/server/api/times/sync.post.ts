import z from 'zod';

import { times } from '@zeity/database/time';
import { TIME_TYPES, AUDIT_ENTITY_TIME, AUDIT_ACTION_CREATE } from '@zeity/types';
import { doesTasksBelongToOrganisation } from '~~/server/utils/task';

export default defineEventHandler(async event => {
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
      statusCode: 400,
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
        statusCode: 403,
        message: 'Forbidden',
      });
    }
  }

  const taskIds = body.data.map(time => time.taskId).filter((id): id is string => !!id);

  if (taskIds.length > 0) {
    const isOrganisationTask = await doesTasksBelongToOrganisation(taskIds, organisation.value);
    if (!isOrganisationTask) {
      throw createError({
        statusCode: 403,
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
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  return await useDrizzle().transaction(async tx => {
    const result = await tx
      .insert(times)
      .values(
        body.data.map(time => ({
          ...time,
          organisationId: organisation.value,
          organisationMemberId,
        })),
      )
      .returning();

    if (result.length > 0) {
      await logAuditEvents({
        tx,
        events: result.map(entry => ({
          entityType: AUDIT_ENTITY_TIME,
          entityId: entry.id,
          action: AUDIT_ACTION_CREATE,
          oldValues: null,
          newValues: entry,
          organisationId: organisation.value,
          organisationMemberId,
        })),
      });
    }

    return result;
  });
});

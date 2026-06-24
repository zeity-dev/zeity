import { z } from 'zod';

import { times } from '@zeity/database/time';
import { TIME_TYPES, TIME_TYPE_MANUAL } from '@zeity/types/time';
import { AUDIT_ENTITY_TIME, AUDIT_ACTION_CREATE } from '@zeity/types/audit-log';
import { doesProjectsBelongsToOrganisation } from '~~/server/utils/project';
import { doesTasksBelongToOrganisation } from '~~/server/utils/task';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const body = await readValidatedBody(
    event,
    z.object({
      type: z.enum(TIME_TYPES).default(TIME_TYPE_MANUAL),
      start: z.coerce.date(),
      duration: z.coerce.number().nonnegative().default(0),
      // tags: z.array(z.number()).optional(),
      projectId: z.uuid().nullable().optional(),
      taskId: z.uuid().nullable().optional(),
      notes: z.string().optional(),
    }).safeParse,
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

  if (body.data.taskId) {
    const isOrganisationTask = await doesTasksBelongToOrganisation(
      body.data.taskId,
      organisation.value,
    );
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
      .values({
        ...body.data,
        organisationId: organisation.value,
        organisationMemberId,
      })
      .returning()
      .then(data => data[0]);

    if (!result) {
      console.error('Failed to create time', result);
      throw createError({
        statusCode: 500,
        message: 'Failed to create time',
      });
    }

    await logAuditEvent({
      tx,
      event: {
        entityType: AUDIT_ENTITY_TIME,
        action: AUDIT_ACTION_CREATE,
        entityId: result.id,
        oldValues: null,
        newValues: result as unknown as Record<string, unknown>,
        organisationId: organisation.value,
        organisationMemberId,
      },
    });

    return result;
  });
});

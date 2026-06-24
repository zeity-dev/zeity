import { z } from 'zod';

import { eq } from '@zeity/database';
import { times } from '@zeity/database/time';
import { AUDIT_ENTITY_TIME, AUDIT_ACTION_DELETE } from '@zeity/types';
import { findTimeById } from '~~/server/utils/time';
import { logAuditEvent } from '~~/server/utils/audit-log';

export default defineEventHandler(async event => {
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
  ).then(member => member?.id);

  if (
    existing.organisationId !== organisation.value ||
    existing.organisationMemberId !== organisationMemberId
  ) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const db = useDrizzle();
  await db.transaction(async tx => {
    await logAuditEvent({
      tx,
      event: {
        entityType: AUDIT_ENTITY_TIME,
        action: AUDIT_ACTION_DELETE,
        entityId: params.data.id,
        oldValues: existing,
        newValues: null,
        organisationId: organisation.value,
        organisationMemberId: organisationMemberId!,
      },
    });

    await tx.delete(times).where(eq(times.id, params.data.id));
  });

  return sendNoContent(event);
});

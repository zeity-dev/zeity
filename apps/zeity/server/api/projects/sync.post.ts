import z from 'zod';
import { projects } from '@zeity/database/project';
import { PROJECT_STATUS_ACTIVE, PROJECT_STATUSES } from '@zeity/types';

export default defineEventHandler(async event => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const body = await readValidatedBody(
    event,
    z.array(
      z.object({
        name: z.string().max(150),
        status: z.enum(PROJECT_STATUSES).default(PROJECT_STATUS_ACTIVE),
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

  const result = await useDrizzle()
    .insert(projects)
    .values(
      body.data.map(project => ({
        ...project,
        userId: session.user.id,
        organisationId: organisation.value,
      })),
    )
    .returning();

  return result;
});

import { z } from 'zod';

import { and, eq } from '@zeity/database';
import { tasks } from '@zeity/database/task';
import { projects } from '@zeity/database/project';
import { userIdBelongsToOrganisation } from '~~/server/utils/organisation-permission';

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

  if (
    !(await userIdBelongsToOrganisation(session.user.id, {
      id: organisation.value,
    }))
  ) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const result = await useDrizzle()
    .select({
      id: tasks.id,
      name: tasks.name,
      start: tasks.start,
      duration: tasks.duration,
      notes: tasks.notes,
      projectId: tasks.projectId,
      recurrenceFrequency: tasks.recurrenceFrequency,
      recurrenceWeekdays: tasks.recurrenceWeekdays,
      recurrenceDayOfMonth: tasks.recurrenceDayOfMonth,
      recurrenceEnd: tasks.recurrenceEnd,
      project: {
        id: projects.id,
        name: projects.name,
      },
      organisationId: tasks.organisationId,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(eq(tasks.id, params.data.id), eq(tasks.organisationId, organisation.value)))
    .limit(1)
    .then(res => res[0]);
  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  return result;
});

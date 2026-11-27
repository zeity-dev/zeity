import { createError, defineHandler } from 'nuxt/server';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { requireOrganisationSession } from '#server/utils/organisation-session';
import { getSafeRouterParams } from '#server/utils/zod';
import { and, eq } from '@zeity/database';
import { projects } from '@zeity/database/project';
import { tasks } from '@zeity/database/task';
import { userIdBelongsToOrganisation } from '~~/server/utils/organisation-permission';

export default defineHandler(async event => {
  const session = await requireUserSession(event);
  const organisation = await requireOrganisationSession(event);

  const params = await getSafeRouterParams(
    event,
    z.object({
      id: z.uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  if (
    !(await userIdBelongsToOrganisation(session.user.id, {
      id: organisation.value,
    }))
  ) {
    throw createError({
      status: 403,
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
      status: 404,
      message: 'Not Found',
    });
  }

  return result;
});

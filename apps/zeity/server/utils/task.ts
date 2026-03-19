import { eq, and, inArray } from '@zeity/database';
import { tasks } from '@zeity/database/task';

export function doesTaskExist(taskId: string): Promise<boolean> {
  return useDrizzle()
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1)
    .then(res => res[0]?.id === taskId);
}

export function doesTasksBelongToOrganisation(
  taskIds: string | string[],
  organisationId: string,
): Promise<boolean> {
  const ids = Array.isArray(taskIds)
    ? // deduplicate ids
      [...new Set(taskIds)]
    : [taskIds];

  if (ids.length === 0) return Promise.resolve(true);

  return useDrizzle()
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.organisationId, organisationId), inArray(tasks.id, ids)))
    .then(res => res.length === ids.length);
}

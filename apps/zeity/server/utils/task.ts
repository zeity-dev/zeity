import { eq, and } from '@zeity/database';
import { tasks } from '@zeity/database/task';

export function doesTaskExist(taskId: string): Promise<boolean> {
  return useDrizzle()
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1)
    .then(res => res[0]?.id === taskId);
}

export function doesTaskBelongToOrganisation(
  taskId: string,
  organisationId: string,
): Promise<boolean> {
  return useDrizzle()
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.organisationId, organisationId)))
    .limit(1)
    .then(res => res.length > 0);
}

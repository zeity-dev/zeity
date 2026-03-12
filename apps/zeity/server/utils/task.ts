import { eq, and } from '@zeity/database';
import { tasks } from '@zeity/database/task';
import { taskAssignments } from '@zeity/database/task-assignment';
import { projects } from '@zeity/database/project';

export function findTaskById(taskId: string) {
  return useDrizzle()
    .select({
      id: tasks.id,
      name: tasks.name,
      start: tasks.start,
      duration: tasks.duration,
      notes: tasks.notes,
      projectId: tasks.projectId,
      recurrence: tasks.recurrence,
      organisationId: tasks.organisationId,
      project: {
        id: projects.id,
        name: projects.name,
      },
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(eq(tasks.id, taskId))
    .limit(1)
    .then(res => res[0]);
}

export function doesTaskExist(taskId: string): Promise<boolean> {
  return useDrizzle()
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.id, taskId))
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
    .then(res => res.length > 0);
}

export function getTaskAssignments(taskId: string) {
  return useDrizzle().select().from(taskAssignments).where(eq(taskAssignments.taskId, taskId));
}

export function getTasksByOrganisationMemberId(organisationMemberId: string) {
  return useDrizzle()
    .select({ taskId: taskAssignments.taskId })
    .from(taskAssignments)
    .where(eq(taskAssignments.organisationMemberId, organisationMemberId));
}

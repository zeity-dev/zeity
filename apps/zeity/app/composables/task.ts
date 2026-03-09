import type { Task, NewTask } from '@zeity/types/task';
import { useTaskStore } from '~/stores/taskStore';

interface FetchTasksOptions {
  offset?: number;
  limit?: number;
  search?: string;
  assignedTo?: string[];
}

function fetchTasks(options?: FetchTasksOptions): Promise<Task[]> {
  return $fetch('/api/tasks', {
    method: 'GET',
    params: options,
  });
}

function fetchTask(id: string): Promise<Task> {
  return $fetch(`/api/tasks/${id}`, {
    method: 'GET',
  });
}

function postTask(data: NewTask): Promise<Task> {
  return $fetch('/api/tasks', {
    method: 'POST',
    body: data,
  });
}

function patchTask(id: string, data: Partial<Task>): Promise<Task> {
  return $fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

function deleteTask(id: string) {
  return $fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
}

// Assignments

function fetchTaskAssignments(taskId: string) {
  return $fetch(`/api/tasks/${taskId}/assignments`, {
    method: 'GET',
  });
}

function postTaskAssignment(taskId: string, organisationMemberId: string) {
  return $fetch(`/api/tasks/${taskId}/assignments`, {
    method: 'POST',
    body: { organisationMemberId },
  });
}

function deleteTaskAssignment(taskId: string, memberId: string) {
  return $fetch(`/api/tasks/${taskId}/assignments/${memberId}`, {
    method: 'DELETE',
  });
}

export function useTask() {
  const { loggedIn } = useUserSession();
  const { currentOrganisationId } = useOrganisation();

  const store = useTaskStore();

  async function loadTasks(options?: FetchTasksOptions) {
    if (!loggedIn.value) return;
    const tasks = await fetchTasks(options);
    store.upsertTasks(tasks);
    return tasks;
  }

  async function loadTask(id: string) {
    if (!loggedIn.value) return;
    const task = await fetchTask(id);
    store.upsertTasks([task]);
    return task;
  }

  function getOrganisationTasks() {
    const ref = store.findTasks(
      task => !task.organisationId || task.organisationId === currentOrganisationId.value,
    );
    return computed(() => ref.value);
  }

  function findTaskById(id: string) {
    const ref = store.findTaskById(id);
    return computed(() => ref.value);
  }

  async function createTask(data: NewTask) {
    if (!loggedIn.value) return;
    const task = await postTask(data);
    store.insertTask(task);
    return task;
  }

  async function updateTask(id: string, data: Partial<Task>) {
    if (!loggedIn.value) return;
    const task = await patchTask(id, data);
    store.updateTask(id, task);
    return task;
  }

  async function removeTask(id: string) {
    if (!loggedIn.value) return;
    await deleteTask(id);
    store.removeTask(id);
  }

  // Assignments
  async function loadAssignments(taskId: string) {
    if (!loggedIn.value) return;
    return fetchTaskAssignments(taskId);
  }

  async function addAssignment(taskId: string, organisationMemberId: string) {
    if (!loggedIn.value) return;
    return postTaskAssignment(taskId, organisationMemberId);
  }

  async function removeAssignment(taskId: string, memberId: string) {
    if (!loggedIn.value) return;
    return deleteTaskAssignment(taskId, memberId);
  }

  return {
    loadTasks,
    loadTask,

    findTaskById,
    getOrganisationTasks,

    createTask,
    updateTask,
    removeTask,

    loadAssignments,
    addAssignment,
    removeAssignment,
  };
}

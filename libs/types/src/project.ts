export const PROJECT_STATUS_ACTIVE = 'active';
export const PROJECT_STATUS_CLOSED = 'closed';

export const PROJECT_STATUSES = [
  PROJECT_STATUS_ACTIVE,
  PROJECT_STATUS_CLOSED,
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  id: string;

  name: string;
  status: ProjectStatus;
  notes: string;

  userId?: string | null;
  organisationId?: string;

  createdAt?: string;
  updatedAt?: string;
}

export type NewProject = Omit<Project, 'id'>;

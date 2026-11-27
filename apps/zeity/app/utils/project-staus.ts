import {
  PROJECT_STATUS_ACTIVE,
  PROJECT_STATUS_CLOSED,
  type ProjectStatus,
} from '@zeity/types/project';

const projectStatusColorMap = {
  [PROJECT_STATUS_ACTIVE]: 'success',
  [PROJECT_STATUS_CLOSED]: 'error',
} as const;
export function getProjectStatusColor(status: ProjectStatus) {
  return projectStatusColorMap[status];
}

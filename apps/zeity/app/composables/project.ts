import type { Project } from '@zeity/types';
import { useProjectStore } from '~/stores/projectStore';

const API_TIMEOUT = 10_000;

interface FetchProjectsOptions {
  offset?: number;
  limit?: number;
  sort?: 'name' | 'createdAt';
  search?: string;
  status?: string[];
}

function fetchProjects(options?: FetchProjectsOptions): Promise<Project[]> {
  return $fetch('/api/projects', {
    method: 'GET',
    params: options,
    timeout: API_TIMEOUT,
  });
}

function fetchProject(id: string): Promise<Project> {
  return $fetch(`/api/projects/${id}`, {
    method: 'GET',
    timeout: API_TIMEOUT,
  });
}

function postProject(data: Project): Promise<Project> {
  return $fetch('/api/projects', {
    method: 'POST',
    body: data,
    timeout: API_TIMEOUT,
  });
}

function patchProject(id: string, data: Partial<Project>): Promise<Project> {
  return $fetch(`/api/projects/${id}`, {
    method: 'PATCH',
    body: data,
    timeout: API_TIMEOUT,
  });
}

function deleteProject(id: string) {
  return $fetch(`/api/projects/${id}`, {
    method: 'DELETE',
    timeout: API_TIMEOUT,
  });
}

export function useProject() {
  const { t } = useI18n();
  const toast = useToast();
  const { loggedIn } = useUserSession();
  const { currentOrganisationId } = useOrganisation();
  const { isOnline } = useNetworkStatus();

  const store = useProjectStore();

  async function loadProjects(options?: FetchProjectsOptions) {
    if (!loggedIn.value) return;
    const projects = await fetchProjects(options);
    store.upsertProjects(projects);
    return projects;
  }
  async function loadProject(id: string) {
    if (!loggedIn.value) return;
    const project = await fetchProject(id);
    store.upsertProjects([project]);
    return project;
  }

  function getOrganisationProjects() {
    const ref = store.findProjects(
      (project) =>
        !project.organisationId ||
        project.organisationId === currentOrganisationId.value,
    );
    return computed(() => ref.value);
  }

  function getOfflineProjects() {
    const ref = store.findProjects((project) => !project.organisationId);
    return computed(() => ref.value);
  }

  function findProjectById(id: string) {
    const ref = store.findProjectById(id);
    return computed(() => ref.value);
  }

  async function createProject(data: Project) {
    if (loggedIn.value && isOnline.value) {
      try {
        const project = await postProject(data);
        store.insertProject(project);
        return project;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error creating project:', error);
        }
        toast.add({
          color: 'warning',
          icon: 'i-lucide-wifi-off',
          title: t('network.savedLocally.title'),
          description: t('network.savedLocally.description'),
          duration: 5000,
        });
      }
    }

    return store.insertProject(data);
  }
  async function updateProject(id: string, data: Partial<Project>) {
    if (loggedIn.value && isOnline.value && isOnlineProject(id)) {
      try {
        const project = await patchProject(id, data);
        store.updateProject(id, project);
        return project;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error creating project:', error);
        }
      }
    }

    return store.updateProject(id, data);
  }
  async function removeProject(id: string) {
    if (loggedIn.value && isOnline.value && isOnlineProject(id)) {
      try {
        await deleteProject(id);
        return store.removeProject(id);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error creating project:', error);
        }
      }
    }

    return store.removeProject(id);
  }

  function isOnlineProject(idOrProject: string | Project) {
    const project =
      typeof idOrProject === 'object'
        ? idOrProject
        : findProjectById(idOrProject).value;
    return !!project?.organisationId;
  }

  return {
    loadProjects,
    loadProject,

    findProjectById,
    getOrganisationProjects,
    getOfflineProjects,

    createProject,
    updateProject,
    removeProject,

    isOnlineProject,
  };
}

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import TaskCreatePage from '~/pages/tasks/create.vue';
import { TASK_RECURRENCE_ONCE } from '@zeity/types';

// Mock useOrganisation
const currentOrganisationIdRef = ref<string | null>('org-1');
const userHasPrivilegedOrganisationRoleMock = vi.fn(() => ref(true));
mockNuxtImport('useOrganisation', () => {
  return () => ({
    currentOrganisationId: currentOrganisationIdRef,
    userHasPrivilegedOrganisationRole: userHasPrivilegedOrganisationRoleMock,
  });
});

// Mock useTask
const createTaskMock = vi.fn();
mockNuxtImport('useTask', () => {
  return () => ({
    createTask: createTaskMock,
  });
});

// Mock navigateTo
const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
}));
mockNuxtImport('navigateTo', () => navigateToMock);

// Register session endpoint
registerEndpoint('/api/_auth/session', () => ({ user: null }));

describe('Task Create Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentOrganisationIdRef.value = 'org-1';
    userHasPrivilegedOrganisationRoleMock.mockReturnValue(ref(true));
  });

  describe('Rendering', () => {
    it('should render the page title', async () => {
      const wrapper = await mountSuspended(TaskCreatePage);

      expect(wrapper.find('h2').text()).toBe('Create Task');
    });

    it('should render breadcrumb with link to tasks', async () => {
      const wrapper = await mountSuspended(TaskCreatePage);

      const breadcrumb = wrapper.findComponent({ name: 'UBreadcrumb' });
      expect(breadcrumb.exists()).toBe(true);
    });

    it('should render the TaskForm component', async () => {
      const wrapper = await mountSuspended(TaskCreatePage);

      const form = wrapper.findComponent({ name: 'TaskForm' });
      expect(form.exists()).toBe(true);
    });
  });

  describe('Access Control', () => {
    it('should redirect non-admin users to /tasks', async () => {
      userHasPrivilegedOrganisationRoleMock.mockReturnValue(ref(false));

      await mountSuspended(TaskCreatePage);
      await flushPromises();

      expect(navigateToMock).toHaveBeenCalledWith('/tasks');
    });
  });

  describe('Form Submission', () => {
    it('should navigate to task detail on successful creation', async () => {
      createTaskMock.mockResolvedValue({ id: 'new-task-id' });

      const wrapper = await mountSuspended(TaskCreatePage);
      const form = wrapper.findComponent({ name: 'TaskForm' });

      await form.vm.$emit('submit', {
        name: 'New Task',
        start: '2026-03-13T10:00:00Z',
        recurrenceFrequency: TASK_RECURRENCE_ONCE,
      });
      await flushPromises();

      expect(createTaskMock).toHaveBeenCalled();
      expect(navigateToMock).toHaveBeenCalledWith('/tasks/new-task-id');
    });

    it('should navigate to /tasks if creation returns no task', async () => {
      createTaskMock.mockResolvedValue(undefined);

      const wrapper = await mountSuspended(TaskCreatePage);
      const form = wrapper.findComponent({ name: 'TaskForm' });

      await form.vm.$emit('submit', {
        name: 'New Task',
        start: '2026-03-13T10:00:00Z',
        recurrenceFrequency: TASK_RECURRENCE_ONCE,
      });
      await flushPromises();

      expect(navigateToMock).toHaveBeenCalledWith('/tasks');
    });
  });
});

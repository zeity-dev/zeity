import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import TaskEditPage from '~/pages/tasks/[id]/edit.vue';

// Mock useOrganisation
const userHasPrivilegedOrganisationRoleMock = vi.fn(() => ref(true));
mockNuxtImport('useOrganisation', () => {
  return () => ({
    userHasPrivilegedOrganisationRole: userHasPrivilegedOrganisationRoleMock,
  });
});

// Mock useTask
const updateTaskMock = vi.fn();
mockNuxtImport('useTask', () => {
  return () => ({
    updateTask: updateTaskMock,
  });
});

// Mock navigateTo
const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
}));
mockNuxtImport('navigateTo', () => navigateToMock);

// Mock useRoute
mockNuxtImport('useRoute', () => {
  return () => ({
    params: { id: 'task-1' },
  });
});

// Register session endpoint
registerEndpoint('/api/_auth/session', () => ({ user: null }));

const mockTask = {
  id: 'task-1',
  name: 'Daily standup',
  start: '2026-03-13T09:00:00Z',
  duration: 900000,
  notes: '',
  recurrenceFrequency: 'daily',
  recurrenceWeekdays: [],
  recurrenceDayOfMonth: null,
  recurrenceEnd: null,
  organisationId: 'org-1',
};

describe('Task Edit Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    userHasPrivilegedOrganisationRoleMock.mockReturnValue(ref(true));

    registerEndpoint('/api/tasks/task-1', () => mockTask);
  });

  describe('Rendering', () => {
    it('should render the edit page title', async () => {
      const wrapper = await mountSuspended(TaskEditPage);

      expect(wrapper.find('h2').text()).toBe('Edit Task');
    });

    it('should render breadcrumb', async () => {
      const wrapper = await mountSuspended(TaskEditPage);

      const breadcrumb = wrapper.findComponent({ name: 'UBreadcrumb' });
      expect(breadcrumb.exists()).toBe(true);
    });

    it('should render TaskForm with task data', async () => {
      const wrapper = await mountSuspended(TaskEditPage);

      const form = wrapper.findComponent({ name: 'TaskForm' });
      expect(form.exists()).toBe(true);
    });
  });

  describe('Access Control', () => {
    it('should redirect non-admin users to /tasks', async () => {
      userHasPrivilegedOrganisationRoleMock.mockReturnValue(ref(false));

      await mountSuspended(TaskEditPage);
      await flushPromises();

      expect(navigateToMock).toHaveBeenCalledWith('/tasks');
    });
  });

  describe('Form Submission', () => {
    it('should call updateTask and navigate on save', async () => {
      updateTaskMock.mockResolvedValue({ id: 'task-1', name: 'Updated' });

      const wrapper = await mountSuspended(TaskEditPage);
      const form = wrapper.findComponent({ name: 'TaskForm' });

      await form.vm.$emit('submit', { name: 'Updated' });
      await flushPromises();

      expect(updateTaskMock).toHaveBeenCalledWith('task-1', { name: 'Updated' });
      expect(navigateToMock).toHaveBeenCalledWith('/tasks/task-1');
    });
  });
});

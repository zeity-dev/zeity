import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import TaskDetailPage from '~/pages/tasks/[id]/index.vue';

// Mock useOrganisation
const userHasPrivilegedOrganisationRoleMock = vi.fn(() => ref(true));
mockNuxtImport('useOrganisation', () => {
  return () => ({
    userHasPrivilegedOrganisationRole: userHasPrivilegedOrganisationRoleMock,
  });
});

// Mock useTask
const removeTaskMock = vi.fn();
mockNuxtImport('useTask', () => {
  return () => ({
    removeTask: removeTaskMock,
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
  notes: 'Team sync',
  recurrenceFrequency: 'daily',
  recurrenceWeekdays: [],
  recurrenceDayOfMonth: null,
  recurrenceEnd: null,
  organisationId: 'org-1',
  projectId: null,
  project: null,
};

const mockAssignments = [
  { taskId: 'task-1', organisationMemberId: 'member-1', user: { name: 'Alice' } },
];

// Use mutable variables so a single registerEndpoint reads the latest value
let currentTask: any = mockTask;
let currentAssignments: any = mockAssignments;

describe('Task Detail Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    userHasPrivilegedOrganisationRoleMock.mockReturnValue(ref(true));
    currentTask = { ...mockTask };
    currentAssignments = [...mockAssignments];

    // Clear Nuxt's useFetch cache to prevent stale data across tests
    clearNuxtData();

    registerEndpoint('/api/tasks/task-1', () => currentTask);
    registerEndpoint('/api/tasks/task-1/assignments', () => currentAssignments);
  });

  describe('Rendering', () => {
    it('should render the task name as heading', async () => {
      const wrapper = await mountSuspended(TaskDetailPage);

      expect(wrapper.find('h2').text()).toBe('Daily standup');
    });

    it('should show recurrence badge', async () => {
      const wrapper = await mountSuspended(TaskDetailPage);

      const badge = wrapper.findComponent({ name: 'UBadge' });
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toContain('Daily');
    });

    it('should show notes when present', async () => {
      const wrapper = await mountSuspended(TaskDetailPage);

      expect(wrapper.text()).toContain('Team sync');
    });

    it('should render breadcrumb', async () => {
      const wrapper = await mountSuspended(TaskDetailPage);

      const breadcrumb = wrapper.findComponent({ name: 'UBreadcrumb' });
      expect(breadcrumb.exists()).toBe(true);
    });
  });

  describe('Admin Actions', () => {
    it('should show edit and delete buttons for admin users', async () => {
      const wrapper = await mountSuspended(TaskDetailPage);

      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const editButton = buttons.find(btn => btn.props('label') === 'Edit');
      const deleteButton = buttons.find(
        btn => btn.props('label') === 'Delete',
      );

      expect(editButton).toBeDefined();
      expect(deleteButton).toBeDefined();
    });

    it('should hide edit and delete buttons for non-admin users', async () => {
      userHasPrivilegedOrganisationRoleMock.mockReturnValue(ref(false));

      const wrapper = await mountSuspended(TaskDetailPage);

      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const editButton = buttons.find(btn => btn.props('label') === 'Edit');
      const deleteButton = buttons.find(btn => btn.props('label') === 'Delete');

      expect(editButton).toBeUndefined();
      expect(deleteButton).toBeUndefined();
    });
  });

  describe('Delete', () => {
    it('should call removeTask and navigate on delete', async () => {
      removeTaskMock.mockResolvedValue(undefined);

      const wrapper = await mountSuspended(TaskDetailPage);

      // Find the page-level delete button (variant=outline), not assignment remove buttons (variant=ghost)
      const deleteButton = wrapper
        .findAllComponents({ name: 'UButton' })
        .find(btn => btn.props('label') === 'Delete');

      expect(deleteButton).toBeDefined();
      await deleteButton!.find('button').trigger('click');
      await flushPromises();

      expect(removeTaskMock).toHaveBeenCalledWith('task-1');
      expect(navigateToMock).toHaveBeenCalledWith('/tasks');
    });
  });

  describe('Weekly recurrence', () => {
    it('should display weekdays for weekly recurrence', async () => {
      currentTask = {
        ...mockTask,
        recurrenceFrequency: 'weekly',
        recurrenceWeekdays: [1, 3, 5],
      };

      const wrapper = await mountSuspended(TaskDetailPage);

      expect(wrapper.text()).toContain('Weekdays');
    });
  });

  describe('Monthly recurrence', () => {
    it('should display day of month for monthly recurrence', async () => {
      currentTask = {
        ...mockTask,
        recurrenceFrequency: 'monthly',
        recurrenceDayOfMonth: 15,
      };

      const wrapper = await mountSuspended(TaskDetailPage);

      expect(wrapper.text()).toContain('Day of Month');
      expect(wrapper.text()).toContain('15');
    });
  });

  describe('Recurrence end', () => {
    it('should show recurrence end date when present', async () => {
      currentTask = {
        ...mockTask,
        recurrenceEnd: '2026-12-31T00:00:00Z',
      };

      const wrapper = await mountSuspended(TaskDetailPage);

      expect(wrapper.text()).toContain('Recurrence End');
    });
  });

  describe('Assignment List', () => {
    it('should render the TaskAssignmentList component', async () => {
      const wrapper = await mountSuspended(TaskDetailPage);

      const assignmentList = wrapper.findComponent({ name: 'TaskAssignmentList' });
      expect(assignmentList.exists()).toBe(true);
    });
  });
});

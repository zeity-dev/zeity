import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import TaskAssignmentList from '~/components/task/AssignmentList.vue';
import { TASK_RECURRENCE_ONCE } from '@zeity/types/task';

// Mock useTask
const addAssignmentMock = vi.fn();
const removeAssignmentMock = vi.fn();
mockNuxtImport('useTask', () => {
  return () => ({
    addAssignment: addAssignmentMock,
    removeAssignment: removeAssignmentMock,
  });
});

// Register session endpoint
registerEndpoint('/api/_auth/session', () => ({ user: null }));

const taskProp = {
  id: 'task-1',
  name: 'Test Task',
  start: '2026-03-13T09:00:00Z',
  recurrenceFrequency: TASK_RECURRENCE_ONCE,
  organisationId: 'org-1',
};

const mockAssignments = [
  {
    taskId: 'task-1',
    organisationMemberId: 'member-1',
    user: { name: 'Alice', image: null },
  },
  {
    taskId: 'task-1',
    organisationMemberId: 'member-2',
    user: { name: 'Bob', image: null },
  },
];

// Use mutable variable for endpoint response
let currentAssignments: any[] = mockAssignments;
registerEndpoint('/api/tasks/task-1/assignments', () => currentAssignments);

describe('TaskAssignmentList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentAssignments = [...mockAssignments];

    // Clear Nuxt's useFetch cache to prevent stale data across tests
    clearNuxtData();
  });

  describe('Rendering', () => {
    it('should render the title', async () => {
      const wrapper = await mountSuspended(TaskAssignmentList, {
        props: { task: taskProp, isAdmin: true },
      });

      expect(wrapper.text()).toContain('Assigned Members');
    });

    it('should render assigned members', async () => {
      const wrapper = await mountSuspended(TaskAssignmentList, {
        props: { task: taskProp, isAdmin: false },
      });

      expect(wrapper.text()).toContain('Alice');
      expect(wrapper.text()).toContain('Bob');
    });

    it('should show empty message when no assignments', async () => {
      currentAssignments = [];

      const wrapper = await mountSuspended(TaskAssignmentList, {
        props: { task: taskProp, isAdmin: false },
      });

      expect(wrapper.text()).toContain('No members assigned');
    });
  });

  describe('Admin Actions', () => {
    it('should show add button for admins', async () => {
      const wrapper = await mountSuspended(TaskAssignmentList, {
        props: { task: taskProp, isAdmin: true },
      });

      const addComponent = wrapper.findComponent({ name: 'TaskAssignmentAdd' });
      expect(addComponent.exists()).toBe(true);
    });

    it('should hide add button for non-admins', async () => {
      const wrapper = await mountSuspended(TaskAssignmentList, {
        props: { task: taskProp, isAdmin: false },
      });

      const addComponent = wrapper.findComponent({ name: 'TaskAssignmentAdd' });
      expect(addComponent.exists()).toBe(false);
    });

    it('should show remove buttons for admins', async () => {
      const wrapper = await mountSuspended(TaskAssignmentList, {
        props: { task: taskProp, isAdmin: true },
      });

      const removeButtons = wrapper
        .findAllComponents({ name: 'UButton' })
        .filter(btn => btn.find('button').attributes('aria-label') === 'Remove');
      expect(removeButtons.length).toBe(2);
    });

    it('should hide remove buttons for non-admins', async () => {
      const wrapper = await mountSuspended(TaskAssignmentList, {
        props: { task: taskProp, isAdmin: false },
      });

      const removeButtons = wrapper
        .findAllComponents({ name: 'UButton' })
        .filter(btn => btn.find('button').attributes('aria-label') === 'Remove');
      expect(removeButtons.length).toBe(0);
    });
  });

  describe('Remove Assignment', () => {
    it('should call removeAssignment when remove button clicked', async () => {
      removeAssignmentMock.mockResolvedValue(undefined);

      const wrapper = await mountSuspended(TaskAssignmentList, {
        props: { task: taskProp, isAdmin: true },
      });

      const removeButton = wrapper
        .findAllComponents({ name: 'UButton' })
        .find(btn => btn.find('button').attributes('aria-label') === 'Remove');

      await removeButton!.find('button').trigger('click');
      await flushPromises();

      expect(removeAssignmentMock).toHaveBeenCalledWith('task-1', 'member-1');
    });
  });
});

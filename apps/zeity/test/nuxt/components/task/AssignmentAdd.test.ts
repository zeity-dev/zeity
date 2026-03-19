import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import TaskAssignmentAdd from '~/components/task/AssignmentAdd.vue';

// Register session endpoint
registerEndpoint('/api/_auth/session', () => ({ user: null }));

const taskProp = {
  id: 'task-1',
  name: 'Test Task',
  start: '2026-03-13T09:00:00Z',
  recurrenceFrequency: 'once' as const,
  organisationId: 'org-1',
};

const mockMembers = {
  items: [
    { id: 'member-1', user: { name: 'Alice', image: null } },
    { id: 'member-2', user: { name: 'Bob', image: null } },
    { id: 'member-3', user: { name: 'Charlie', image: null } },
  ],
};

// Use mutable variable for endpoint response
let currentMembers = mockMembers;
registerEndpoint('/api/organisation/org-1/member', () => currentMembers);

describe('TaskAssignmentAdd', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentMembers = { ...mockMembers };

    clearNuxtData();
  });

  describe('Rendering', () => {
    it('should render the add button', async () => {
      const wrapper = await mountSuspended(TaskAssignmentAdd, {
        props: {
          task: taskProp,
          existingMemberIds: [],
        },
      });

      const addButton = wrapper.findAllComponents({ name: 'UButton' }).find(btn =>
        btn.props('label') === 'Assign',
      );
      expect(addButton).toBeDefined();
    });
  });

  describe('Popover', () => {
    it('should render popover component', async () => {
      const wrapper = await mountSuspended(TaskAssignmentAdd, {
        props: {
          task: taskProp,
          existingMemberIds: [],
        },
      });

      const popover = wrapper.findComponent({ name: 'UPopover' });
      expect(popover.exists()).toBe(true);
    });
  });

  describe('Member Filtering', () => {
    it('should filter out already assigned members', async () => {
      const wrapper = await mountSuspended(TaskAssignmentAdd, {
        props: {
          task: taskProp,
          existingMemberIds: ['member-1'],
        },
      });

      // Trigger data fetch and wait for it to complete
      const vm = wrapper.vm as any;
      await vm.refresh();
      await flushPromises();

      // Check the computed availableMembers filters out assigned members
      const available = vm.availableMembers;
      expect(available.length).toBe(2);
      expect(available.some((m: any) => m.id === 'member-1')).toBe(false);
      expect(available.some((m: any) => m.id === 'member-2')).toBe(true);
    });
  });

  describe('Selection', () => {
    it('should emit add event when member is selected', async () => {
      const wrapper = await mountSuspended(TaskAssignmentAdd, {
        props: {
          task: taskProp,
          existingMemberIds: [],
        },
      });

      // Open popover to trigger data fetch
      const popover = wrapper.findComponent({ name: 'UPopover' });
      await popover.vm.$emit('update:open', true);
      await flushPromises();

      // Call handleSelect directly since popover content renders in a portal
      const vm = wrapper.vm as any;
      vm.handleSelect('member-1');
      await flushPromises();

      expect(wrapper.emitted('add')).toBeTruthy();
      expect(wrapper.emitted('add')![0]).toEqual(['member-1']);
    });
  });
});

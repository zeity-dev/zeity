import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import TasksIndexPage from '~/pages/tasks/index.vue';
import type { Task } from '@zeity/types/task';

// Mock useOrganisation
const currentOrganisationRef = ref<any>({
  id: 'org-1',
  member: { id: 'member-1' },
});
const userHasPrivilegedOrganisationRoleMock = vi.fn(() => ref(true));
mockNuxtImport('useOrganisation', () => {
  return () => ({
    currentOrganisation: currentOrganisationRef,
    userHasPrivilegedOrganisationRole: userHasPrivilegedOrganisationRoleMock,
  });
});

// Register session endpoint
registerEndpoint('/api/_auth/session', () => ({ user: null }));

const mockTasks: Task[] = [
  {
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
  },
  {
    id: 'task-2',
    name: 'Weekly review',
    start: '2026-03-13T14:00:00Z',
    duration: null,
    notes: 'Prepare slides',
    recurrenceFrequency: 'weekly',
    recurrenceWeekdays: [5],
    recurrenceDayOfMonth: null,
    recurrenceEnd: null,
    organisationId: 'org-1',
  },
];

// Use mutable variable for endpoint response
let currentTasks: Task[] = mockTasks;
registerEndpoint('/api/tasks', () => ({ items: currentTasks, total: currentTasks.length }));

async function mountAndWait() {
  const wrapper = await mountSuspended(TasksIndexPage);
  await flushPromises();
  return wrapper;
}

describe('Tasks Index Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentOrganisationRef.value = { id: 'org-1', member: { id: 'member-1' } };
    userHasPrivilegedOrganisationRoleMock.mockReturnValue(ref(true));
    currentTasks = [...mockTasks];

    clearNuxtData();
  });

  describe('Rendering', () => {
    it('should render the page title', async () => {
      const wrapper = await mountAndWait();

      expect(wrapper.find('h2').text()).toBe('Tasks');
    });

    it('should render task cards', async () => {
      const wrapper = await mountAndWait();

      const cards = wrapper.findAllComponents({ name: 'UPageCard' });
      expect(cards.length).toBe(2);
    });

    it('should show add button for admin users', async () => {
      const wrapper = await mountAndWait();

      const addButton = wrapper
        .findAllComponents({ name: 'UButton' })
        .find(btn => btn.props('to') === '/tasks/create');
      expect(addButton).toBeDefined();
    });

    it('should hide add button for non-admin users', async () => {
      userHasPrivilegedOrganisationRoleMock.mockReturnValue(ref(false));

      const wrapper = await mountAndWait();

      const addButton = wrapper
        .findAllComponents({ name: 'UButton' })
        .find(btn => btn.props('to') === '/tasks/create');
      expect(addButton).toBeUndefined();
    });
  });

  describe('My Tasks Filter', () => {
    it('should show my tasks toggle for admin users', async () => {
      const wrapper = await mountAndWait();

      const toggle = wrapper.findComponent({ name: 'USwitch' });
      expect(toggle.exists()).toBe(true);
    });

    it('should hide my tasks toggle for non-admin users', async () => {
      userHasPrivilegedOrganisationRoleMock.mockReturnValue(ref(false));

      const wrapper = await mountAndWait();

      const toggle = wrapper.findComponent({ name: 'USwitch' });
      expect(toggle.exists()).toBe(false);
    });
  });

  describe('Task Display', () => {
    it('should display task names', async () => {
      const wrapper = await mountAndWait();

      expect(wrapper.text()).toContain('Daily standup');
      expect(wrapper.text()).toContain('Weekly review');
    });

    it('should display recurrence badges', async () => {
      const wrapper = await mountAndWait();

      expect(wrapper.text()).toContain('Daily');
      expect(wrapper.text()).toContain('Weekly');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no tasks', async () => {
      currentTasks = [];

      const wrapper = await mountAndWait();

      const empty = wrapper.findComponent({ name: 'UEmpty' });
      expect(empty.exists()).toBe(true);
    });
  });
});

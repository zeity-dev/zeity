import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { reactive, ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import TaskTodayList from '~/components/task/TodayList.vue';
import { TIME_TYPE_MANUAL, type Time } from '@zeity/types';

// Mock useOrganisation
const currentOrganisationRef = ref<any>({
  id: 'org-1',
  member: { id: 'member-1' },
});
mockNuxtImport('useOrganisation', () => {
  return () => ({
    currentOrganisation: currentOrganisationRef,
  });
});

// Mock useTime
const startDraftMock = vi.fn();
const createTimeMock = vi.fn();
mockNuxtImport('useTime', () => {
  return () => ({
    startDraft: startDraftMock,
    createTime: createTimeMock,
  });
});

// Mock useTimerStore — wrap in reactive() so template auto-unwraps refs
const isStartedRef = ref(false);
const findTimeMock = vi.fn(() => ref<Time[]>([]));
mockNuxtImport('useTimerStore', () => {
  return () =>
    reactive({
      isStarted: isStartedRef,
      findTime: findTimeMock,
    });
});

// Register session endpoint
registerEndpoint('/api/_auth/session', () => ({ user: null }));

const mockTodayTasks = [
  {
    id: 'task-1',
    name: 'Daily standup',
    start: new Date().toISOString(),
    duration: 900000,
    notes: 'Team sync',
    recurrenceFrequency: 'daily',
    recurrenceWeekdays: [],
    recurrenceDayOfMonth: null,
    recurrenceEnd: null,
    organisationId: 'org-1',
    projectId: 'proj-1',
  },
  {
    id: 'task-2',
    name: 'Code review',
    start: new Date().toISOString(),
    duration: null,
    notes: '',
    recurrenceFrequency: 'daily',
    recurrenceWeekdays: [],
    recurrenceDayOfMonth: null,
    recurrenceEnd: null,
    organisationId: 'org-1',
    projectId: null,
  },
];

// Use mutable variable for endpoint response
let currentTasks: any[] = mockTodayTasks;
registerEndpoint('/api/tasks', () => currentTasks);

async function mountAndWait() {
  const wrapper = await mountSuspended(TaskTodayList);
  // useLazyFetch with server:false needs client-side fetch to complete
  await flushPromises();
  return wrapper;
}

describe('TaskTodayList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setActivePinia(createPinia());
    currentOrganisationRef.value = { id: 'org-1', member: { id: 'member-1' } };
    isStartedRef.value = false;
    findTimeMock.mockReturnValue(ref([]));
    currentTasks = [...mockTodayTasks];
  });

  describe('Rendering', () => {
    it('should render section title', async () => {
      const wrapper = await mountAndWait();

      expect(wrapper.text()).toContain("Today's Tasks");
    });

    it('should render task names', async () => {
      const wrapper = await mountAndWait();

      expect(wrapper.text()).toContain('Daily standup');
      expect(wrapper.text()).toContain('Code review');
    });

    it('should show "done" label for tasks with duration', async () => {
      const wrapper = await mountAndWait();

      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const doneButton = buttons.find(btn => btn.props('label') === 'Done');
      expect(doneButton).toBeDefined();
    });

    it('should show "start timer" label for tasks without duration', async () => {
      const wrapper = await mountAndWait();

      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const startButton = buttons.find(btn => btn.props('label') === 'Start');
      expect(startButton).toBeDefined();
    });
  });

  describe('Empty State', () => {
    it('should not render when no tasks for today', async () => {
      currentTasks = [];

      const wrapper = await mountAndWait();

      expect(wrapper.find('h3').exists()).toBe(false);
    });
  });

  describe('Task Actions', () => {
    it('should disable start timer button when a draft is already running', async () => {
      isStartedRef.value = true;

      const wrapper = await mountAndWait();

      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const startButton = buttons.find(btn => btn.props('label') === 'Start');
      expect(startButton).toBeDefined();
      expect(startButton!.props('disabled')).toBe(true);
    });
  });

  describe('Completed Tasks Filtering', () => {
    it('should hide a task when a time entry with matching taskId exists today', async () => {
      // findTime returns a time entry for task-1, meaning it was already completed today
      findTimeMock.mockReturnValue(
        ref([
          {
            id: 'time-1',
            type: TIME_TYPE_MANUAL,
            taskId: 'task-1',
            start: new Date().toISOString(),
            duration: 900000,
            notes: '',
            organisationMemberId: 'member-1',
          },
        ]),
      );

      const wrapper = await mountAndWait();

      // task-1 should be hidden because it already has a time entry today
      expect(wrapper.text()).not.toContain('Daily standup');
      // task-2 should still be visible
      expect(wrapper.text()).toContain('Code review');
    });

    it('should hide all tasks when all have time entries today', async () => {
      findTimeMock.mockReturnValue(
        ref([
          {
            id: 'time-1',
            type: TIME_TYPE_MANUAL,
            taskId: 'task-1',
            start: new Date().toISOString(),
            duration: 900000,
            notes: '',
            organisationMemberId: 'member-1',
          },
          {
            id: 'time-2',
            type: TIME_TYPE_MANUAL,
            taskId: 'task-2',
            start: new Date().toISOString(),
            duration: 1800000,
            notes: '',
            organisationMemberId: 'member-1',
          },
        ]),
      );

      const wrapper = await mountAndWait();

      expect(wrapper.text()).not.toContain('Daily standup');
      expect(wrapper.text()).not.toContain('Code review');
      expect(wrapper.find('h3').exists()).toBe(false);
    });

    it('should still show a task when time entry belongs to a different task', async () => {
      findTimeMock.mockReturnValue(
        ref([
          {
            id: 'time-1',
            type: TIME_TYPE_MANUAL,
            taskId: 'other-task-99',
            start: new Date().toISOString(),
            duration: 600000,
            notes: '',
            organisationMemberId: 'member-1',
          },
        ]),
      );

      const wrapper = await mountAndWait();

      expect(wrapper.text()).toContain('Daily standup');
      expect(wrapper.text()).toContain('Code review');
    });
  });
});

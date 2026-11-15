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
registerEndpoint('/api/tasks', () => ({ items: currentTasks }));

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

      const title = wrapper.find('[data-testid="title"]');
      expect(title.exists()).toBe(true);
    });

    it('should render task names', async () => {
      const wrapper = await mountAndWait();

      expect(wrapper.text()).toContain('Daily standup');
      expect(wrapper.text()).toContain('Code review');
    });

    it('should show "done" button for tasks with duration', async () => {
      const wrapper = await mountAndWait();

      const doneButton = wrapper.find('[data-testid="done-button-task-1"]');
      expect(doneButton.exists()).toBe(true);
    });

    it('should show "start timer" button for tasks without duration', async () => {
      const wrapper = await mountAndWait();

      const startButton = wrapper.find('[data-testid="start-timer-button-task-2"]');
      expect(startButton.exists()).toBe(true);
    });
  });

  describe('Empty State', () => {
    it('should not render when no tasks for today', async () => {
      currentTasks = [];

      const wrapper = await mountAndWait();

      const title = wrapper.find('[data-testid="title"]');
      expect(title.exists()).toBe(false);
    });
  });

  describe('Task Actions', () => {
    it('should disable start timer button when a draft is already running', async () => {
      isStartedRef.value = true;

      const wrapper = await mountAndWait();

      const startButton = wrapper.find('[data-testid="start-timer-button-task-2"]');
      expect(startButton.attributes('disabled')).toBeDefined();
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
      const title = wrapper.find('[data-testid="title"]');
      expect(title.exists()).toBe(false);
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

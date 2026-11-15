import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import {
  TASK_RECURRENCE_DAILY,
  TASK_RECURRENCE_MONTHLY,
  TASK_RECURRENCE_ONCE,
  TASK_RECURRENCE_WEEKLY,
} from '@zeity/types';
import TaskForm from '~/components/task/Form.vue';

// Register session endpoint
registerEndpoint('/api/_auth/session', () => ({ user: null }));

const defaultData = {
  name: 'Test task',
  start: '2026-03-13T10:00:00Z',
  duration: null,
  projectId: null,
  notes: '',
  recurrenceFrequency: TASK_RECURRENCE_ONCE,
  recurrenceWeekdays: [],
  recurrenceDayOfMonth: undefined,
  recurrenceEnd: undefined,
};

describe('TaskForm', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Rendering', () => {
    it('should render the form with all fields', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: { data: defaultData },
      });

      const form = wrapper.findComponent({ name: 'UForm' });
      expect(form.exists()).toBe(true);

      // Name field via data-testid
      const nameInput = wrapper.find('[data-testid="name-input"]');
      expect(nameInput.exists()).toBe(true);

      // Notes field via data-testid
      const textarea = wrapper.find('[data-testid="notes-textarea"]');
      expect(textarea.exists()).toBe(true);
    });

    it('should render frequency select', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: { data: defaultData },
      });

      // Use data-testid instead of component name
      const select = wrapper.find('[data-testid="frequency-select"]');
      expect(select.exists()).toBe(true);
    });

    it('should render submit button', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: { data: defaultData },
      });

      const submitButton = wrapper.find('[data-testid="submit-button"]');
      expect(submitButton.exists()).toBe(true);
    });
  });

  describe('Conditional Fields', () => {
    it('should show weekday buttons for weekly recurrence', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: {
          data: {
            ...defaultData,
            recurrenceFrequency: TASK_RECURRENCE_WEEKLY,
          },
        },
      });

      // Check for weekday buttons using data-testid pattern
      expect(wrapper.find('[data-testid="weekday-button-0"]').exists()).toBe(true); // Sunday
      expect(wrapper.find('[data-testid="weekday-button-1"]').exists()).toBe(true); // Monday
      expect(wrapper.find('[data-testid="weekday-button-6"]').exists()).toBe(true); // Saturday
    });

    it('should show day of month input for monthly recurrence', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: {
          data: {
            ...defaultData,
            recurrenceFrequency: TASK_RECURRENCE_MONTHLY,
          },
        },
      });

      // Use data-testid for the day of month input
      expect(wrapper.find('[data-testid="day-of-month-input"]').exists()).toBe(true);
    });

    it('should not show weekday buttons for once recurrence', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: { data: defaultData },
      });

      // Check that weekday buttons don't exist
      expect(wrapper.find('[data-testid="weekday-button-0"]').exists()).toBe(false);
    });

    it('should show recurrence end for non-once frequencies', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: {
          data: {
            ...defaultData,
            recurrenceFrequency: TASK_RECURRENCE_DAILY,
          },
        },
      });

      // Use data-testid for recurrence end input
      expect(wrapper.find('[data-testid="recurrence-end-input"]').exists()).toBe(true);
    });

    it('should not show recurrence end for once frequency', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: { data: defaultData },
      });

      // Check that recurrence end doesn't exist for once frequency
      expect(wrapper.find('[data-testid="recurrence-end-input"]').exists()).toBe(false);
    });
  });

  describe('Weekday Toggle', () => {
    it('should toggle weekday selection on click', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: {
          data: {
            ...defaultData,
            recurrenceFrequency: TASK_RECURRENCE_WEEKLY,
            recurrenceWeekdays: [],
          },
        },
      });

      // Find Monday button using data-testid (day value 1 = Monday)
      const mondayButton = wrapper.find('[data-testid="weekday-button-1"]');
      expect(mondayButton.exists()).toBe(true);

      // Initial state: weekday not selected, should have subtle variant
      // Get the button element and check the parent component is visible
      expect(mondayButton.element).toBeDefined();

      // Click the button to toggle selection
      await mondayButton.trigger('click');
      await flushPromises();

      // After click: weekday should be selected
      // Find the button again to check updated state
      const mondayButtonAfter = wrapper.find('[data-testid="weekday-button-1"]');
      expect(mondayButtonAfter.exists()).toBe(true);

      // Verify that the state was updated by checking the component's state
      const vm = wrapper.vm as any;
      expect(vm.state.recurrenceWeekdays).toContain(1);
    });
  });
});

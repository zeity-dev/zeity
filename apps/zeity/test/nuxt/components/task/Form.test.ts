import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { TASK_RECURRENCE_DAILY, TASK_RECURRENCE_MONTHLY, TASK_RECURRENCE_ONCE, TASK_RECURRENCE_WEEKLY } from '@zeity/types';
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

      // Name field
      const nameInput = wrapper.find('input');
      expect(nameInput.exists()).toBe(true);

      // Notes field
      const textarea = wrapper.findComponent({ name: 'UTextarea' });
      expect(textarea.exists()).toBe(true);
    });

    it('should render frequency select', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: { data: defaultData },
      });

      const select = wrapper.findComponent({ name: 'USelect' });
      expect(select.exists()).toBe(true);
    });

    it('should render submit button', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: { data: defaultData },
      });

      const submitButton = wrapper.find('button[type="submit"]');
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

      // 7 weekday buttons should be present
      expect(wrapper.text()).toContain('Monday');
      expect(wrapper.text()).toContain('Sunday');
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

      expect(wrapper.text()).toContain('Day of Month');
    });

    it('should not show weekday buttons for once recurrence', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: { data: defaultData },
      });

      expect(wrapper.text()).not.toContain('Weekdays');
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

      expect(wrapper.text()).toContain('Recurrence End');
    });

    it('should not show recurrence end for once frequency', async () => {
      const wrapper = await mountSuspended(TaskForm, {
        props: { data: defaultData },
      });

      expect(wrapper.text()).not.toContain('Recurrence End');
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

      // Find Monday button among weekday buttons
      const weekdayButton = wrapper.findAllComponents({ name: 'UButton' }).find(btn => {
        return btn.text() === 'Monday';
      });

      expect(weekdayButton).toBeDefined();

      // Before click: weekday not selected → variant should be 'subtle'
      expect(weekdayButton!.props('variant')).toBe('subtle');

      // Click the inner <button> element to trigger the @click handler
      await weekdayButton!.find('button').trigger('click');
      await flushPromises();

      // After click: weekday selected → variant should be 'solid'
      expect(weekdayButton!.props('variant')).toBe('solid');
    });
  });
});

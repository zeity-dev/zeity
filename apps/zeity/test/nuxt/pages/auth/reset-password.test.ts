import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { readBody } from 'h3';
import ResetPasswordPage from '~/pages/auth/reset-password.vue';

// Mock useI18n
mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
  });
});

// Mock useToast
const addToastMock = vi.fn();
mockNuxtImport('useToast', () => {
  return () => ({
    add: addToastMock,
  });
});

// Mock useUserSession
const fetchMock = vi.fn().mockResolvedValue(undefined);
const userSessionUserRef = ref<{ id: number; email: string } | null>(null);
const loggedInRef = ref(false);
mockNuxtImport('useUserSession', () => {
  return () => ({
    fetch: fetchMock,
    user: userSessionUserRef,
    loggedIn: loggedInRef,
  });
});

// Mock navigateTo
const { navigateToMock } = vi.hoisted(() => {
  return {
    navigateToMock: vi.fn(),
  };
});
mockNuxtImport('navigateTo', () => navigateToMock);

// Mock useRoute
const routeQueryMock = ref<Record<string, string>>({});
mockNuxtImport('useRoute', () => {
  return () => ({
    query: routeQueryMock.value,
  });
});

// Register the auth session endpoint
registerEndpoint('/api/_auth/session', () => {
  return { user: null };
});

describe('Reset Password Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    routeQueryMock.value = { token: 'valid-token-123' };
    userSessionUserRef.value = null;
    loggedInRef.value = false;
    fetchMock.mockResolvedValue(undefined);
  });

  describe('Initial Rendering', () => {
    it('should render reset password form with token', async () => {
      const wrapper = await mountSuspended(ResetPasswordPage, {
        global: {
          mocks: {
            $t: (key: string) => key,
          },
        },
      });

      const pageCard = wrapper.findComponent({ name: 'UPageCard' });
      expect(pageCard.props('title')).toBe('auth.resetPassword.title');
      expect(wrapper.findAll('input[autocomplete="new-password"]').length).toBe(2);
    });

    it('should render password and confirm password fields', async () => {
      const wrapper = await mountSuspended(ResetPasswordPage);

      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      expect(passwordInputs.length).toBe(2);
      expect(passwordInputs[0]?.attributes('type')).toBe('password');
      expect(passwordInputs[1]?.attributes('type')).toBe('password');
    });

    it('should render submit button', async () => {
      const wrapper = await mountSuspended(ResetPasswordPage, {
        global: {
          mocks: {
            $t: (key: string) => key,
          },
        },
      });

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.exists()).toBe(true);
      expect(submitButton.text()).toContain('auth.resetPassword.title');
    });

    it('should render password visibility toggle buttons', async () => {
      const wrapper = await mountSuspended(ResetPasswordPage);

      const eyeButtons = wrapper
        .findAllComponents({ name: 'UButton' })
        .filter(button => ['i-lucide-eye', 'i-lucide-eye-off'].includes(button.props('icon')));
      expect(eyeButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when eye icon is clicked', async () => {
      const wrapper = await mountSuspended(ResetPasswordPage, {
        attachTo: document.body,
        global: {
          mocks: {
            $t: (key: string) => key,
          },
        },
      });

      const passwordInputBefore = wrapper.findAll('input[autocomplete="new-password"]')[0];
      expect(passwordInputBefore?.attributes('type')).toBe('password');

      // Click the eye icon
      const eyeButton = wrapper
        .findAllComponents({ name: 'UButton' })
        .find(button => button.props('icon') === 'i-lucide-eye');
      await eyeButton!.find('button').trigger('click');
      await nextTick();

      const passwordInputAfter = wrapper.findAll('input[autocomplete="new-password"]')[0];
      expect(passwordInputAfter?.attributes('type')).toBe('text');
    });

    it('should toggle back to hidden when clicked again', async () => {
      const wrapper = await mountSuspended(ResetPasswordPage);

      // Click twice
      const eyeButton = wrapper
        .findAllComponents({ name: 'UButton' })
        .find(button => button.props('icon') === 'i-lucide-eye');
      await eyeButton!.find('button').trigger('click');
      await nextTick();

      await eyeButton!.find('button').trigger('click');
      await nextTick();

      const passwordInput = wrapper.findAll('input[autocomplete="new-password"]')[0];
      expect(passwordInput?.attributes('type')).toBe('password');
    });
  });

  describe('Form Submission', () => {
    it('should successfully reset password with valid data', async () => {
      registerEndpoint('/api/auth/reset-password', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(ResetPasswordPage, {
        global: {
          mocks: {
            $t: (key: string) => key,
          },
        },
      });

      // Fill in passwords
      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('newpassword123');
      await passwordInputs[1]?.setValue('newpassword123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

      expect(addToastMock).toHaveBeenCalledWith({
        title: 'auth.resetPassword.success',
        color: 'success',
      });
      expect(fetchMock).toHaveBeenCalled();
      expect(navigateToMock).toHaveBeenCalledWith('/user');
    });

    it('should show error toast on failed submission', async () => {
      registerEndpoint('/api/auth/reset-password', () => {
        return new Response('Invalid token', { status: 400 });
      });

      const wrapper = await mountSuspended(ResetPasswordPage);

      // Fill in passwords
      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('newpassword123');
      await passwordInputs[1]?.setValue('newpassword123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

      expect(addToastMock).toHaveBeenCalledWith({
        title: 'auth.resetPassword.error',
        color: 'error',
      });
      expect(navigateToMock).not.toHaveBeenCalled();
    });

    it('should send token from query param in request', async () => {
      let requestBody: any;
      registerEndpoint('/api/auth/reset-password', async event => {
        requestBody = await readBody(event);
        return new Response(null, { status: 200 });
      });

      routeQueryMock.value = { token: 'my-special-token' };

      const wrapper = await mountSuspended(ResetPasswordPage);

      // Fill in passwords
      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('newpassword123');
      await passwordInputs[1]?.setValue('newpassword123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

      expect(requestBody).toEqual({
        code: 'my-special-token',
        password: 'newpassword123',
      });
    });

    it('should handle pending state during submission', async () => {
      let resolveResetPassword: (value: Response) => void;
      const resetPasswordPromise = new Promise<Response>(resolve => {
        resolveResetPassword = resolve;
      });

      registerEndpoint('/api/auth/reset-password', () => resetPasswordPromise);

      const wrapper = await mountSuspended(ResetPasswordPage);

      // Fill in passwords
      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('newpassword123');
      await passwordInputs[1]?.setValue('newpassword123');

      // Submit form without awaiting
      const submitPromise = wrapper.find('form').trigger('submit.prevent');

      // Give it a tiny bit of time for the pending state to be set
      await flushPromises();

      // Check that pending state is set
      const submitButton = wrapper
        .findAllComponents({ name: 'UButton' })
        .find(button => button.props('type') === 'submit')!;
      expect(submitButton.props('loading')).toBe(true);

      // Resolve the request
      resolveResetPassword!(new Response(null, { status: 200 }));
      await submitPromise;
      await flushPromises();

      // Pending state should be cleared
      expect(submitButton.props('loading')).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate password minimum length', async () => {
      const wrapper = await mountSuspended(ResetPasswordPage);

      // Fill in too short password
      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('short');
      await passwordInputs[1]?.setValue('short');

      // Try to submit
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await flushPromises();

      // Should not submit due to validation
      expect(addToastMock).not.toHaveBeenCalled();
    });

    it('should validate passwords match', async () => {
      const wrapper = await mountSuspended(ResetPasswordPage);

      // Fill in non-matching passwords
      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('password123');
      await passwordInputs[1]?.setValue('different456');

      // Try to submit
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await flushPromises();

      // Should not submit due to validation
      expect(addToastMock).not.toHaveBeenCalled();
    });

    it('should require both password fields', async () => {
      const wrapper = await mountSuspended(ResetPasswordPage);

      // Try to submit without filling anything
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await flushPromises();

      // Should not submit due to validation
      expect(addToastMock).not.toHaveBeenCalled();
    });
  });
});

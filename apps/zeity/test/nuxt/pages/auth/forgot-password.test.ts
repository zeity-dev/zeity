import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { nextTick, ref } from 'vue';
import ForgotPasswordPage from '~/pages/auth/forgot-password.vue';

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

describe('Forgot Password Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    routeQueryMock.value = {};
    userSessionUserRef.value = null;
    loggedInRef.value = false;
    fetchMock.mockResolvedValue(undefined);
  });

  describe('Initial Rendering', () => {
    it('should render forgot password form', async () => {
      const wrapper = await mountSuspended(ForgotPasswordPage, {
        global: {
          mocks: {
            $t: (key: string) => key,
          },
        },
      });

      const pageCard = wrapper.findComponent({ name: 'UPageCard' });
      expect(pageCard.props('title')).toBe('auth.forgotPassword.title');
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.exists()).toBe(true);
      expect(submitButton.text()).toContain('auth.resetPassword.title');
    });

    it('should pre-fill email from query parameter', async () => {
      routeQueryMock.value = { email: 'test@example.com' };

      const wrapper = await mountSuspended(ForgotPasswordPage, {
        attachTo: document.body,
      });

      const emailInput = wrapper
        .findAllComponents({ name: 'UInput' })
        .find(input => input.props('type') === 'email')!;
      expect(emailInput.props('modelValue')).toBe('test@example.com');
    });
  });

  describe('Form Submission', () => {
    it('should successfully submit forgot password request', async () => {
      registerEndpoint('/api/auth/forgot-password', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(ForgotPasswordPage);

      // Fill in email
      await wrapper.find('input[type="email"]').setValue('test@example.com');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(addToastMock).toHaveBeenCalledWith({
        title: 'auth.forgotPassword.success',
        color: 'success',
      });
      expect(fetchMock).toHaveBeenCalled();
    });

    it('should show error toast on failed submission', async () => {
      registerEndpoint('/api/auth/forgot-password', () => {
        return new Response('Not found', { status: 404 });
      });

      const wrapper = await mountSuspended(ForgotPasswordPage);

      // Fill in email
      await wrapper.find('input[type="email"]').setValue('test@example.com');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(addToastMock).toHaveBeenCalledWith({
        title: 'auth.forgotPassword.error',
        color: 'error',
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should handle pending state during submission', async () => {
      let resolveForgotPassword: (value: Response) => void;
      const forgotPasswordPromise = new Promise<Response>(resolve => {
        resolveForgotPassword = resolve;
      });

      registerEndpoint('/api/auth/forgot-password', () => forgotPasswordPromise);

      const wrapper = await mountSuspended(ForgotPasswordPage);

      // Fill in email
      await wrapper.find('input[type="email"]').setValue('test@example.com');

      // Submit form without awaiting
      const submitPromise = wrapper.find('form').trigger('submit.prevent');

      // Give it a tiny bit of time for the pending state to be set
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check that pending state is set
      const submitButton = wrapper.findComponent({ name: 'UButton', props: { type: 'submit' } });
      expect(submitButton.props('loading')).toBe(true);

      // Resolve the request
      resolveForgotPassword!(new Response(null, { status: 200 }));
      await submitPromise;
      await new Promise(resolve => setTimeout(resolve, 200));

      // Pending state should be cleared
      expect(submitButton.props('loading')).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const wrapper = await mountSuspended(ForgotPasswordPage);

      // Fill in invalid email
      await wrapper.find('input[type="email"]').setValue('invalid-email');

      // Try to submit
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not submit due to validation
      expect(addToastMock).not.toHaveBeenCalled();
    });

    it('should require email field', async () => {
      const wrapper = await mountSuspended(ForgotPasswordPage, {
        attachTo: document.body,
      });

      // Try to submit without filling in email
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not submit due to validation
      expect(addToastMock).not.toHaveBeenCalled();
    });
  });
});

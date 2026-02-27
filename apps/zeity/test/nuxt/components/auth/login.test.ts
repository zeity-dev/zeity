import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { nextTick } from 'vue';
import LoginComponent from '~/components/auth/login.vue';

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

// Mock useWebAuthn
const authenticateMock = vi.fn();
const { useWebAuthnMock } = vi.hoisted(() => {
  return {
    useWebAuthnMock: vi.fn(() => ({
      authenticate: authenticateMock,
    })),
  };
});
mockNuxtImport('useWebAuthn', () => {
  return useWebAuthnMock;
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render email and password inputs', async () => {
      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      const slides = wrapper.findAll('.slide');

      expect(slides.length).toBe(2);
      expect(slides[0]!.isVisible()).toBe(true); // Email step visible
      expect(slides[1]!.isVisible()).toBe(false); // Password step hidden

      // Both inputs exist in DOM (using v-show, not v-if)
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
      expect(wrapper.find('input[autocomplete="current-password"]').exists()).toBe(true);

      // Initially, only email input should be visible
      expect(wrapper.find('input[type="email"]').isVisible()).toBe(true);
      // Password input should be hidden initially (showPasswordStep = true means email step is shown)
      expect(wrapper.find('input[autocomplete="current-password"]').isVisible()).toBe(false);
    });

    it('should show email step initially', async () => {
      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // Email and Continue button should be visible
      expect(wrapper.find('input[type="email"]').isVisible()).toBe(true);
      const continueButton = wrapper
        .findAllComponents({ name: 'UButton' })
        .find(btn => btn.props('label') === 'Continue');
      expect(continueButton?.isVisible()).toBe(true);
    });

    it('should show passkey login button', async () => {
      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // The button text is translated, so check for "Login with Passkey"
      expect(wrapper.html()).toContain('Login with Passkey');
    });
  });

  describe('Step Navigation', () => {
    it('should transition to password step when continue is clicked', async () => {
      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      await wrapper.find('input[type="email"]').setValue('test@example.com');

      // Find the continue button by looking for buttons with type="button"
      const buttons = wrapper.findAll('button[type="button"]');
      const continueButton = buttons[0]!; // First button is continue
      await continueButton.trigger('click');

      await nextTick();

      // Password field should be visible after transition
      expect(wrapper.find('input[autocomplete="current-password"]').isVisible()).toBe(true);
    });

    it('should go back to email step when back button is clicked', async () => {
      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // Go to password step
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      const continueButton = wrapper.findAll('button[type="button"]')[0]!;
      await continueButton.trigger('click');
      await nextTick();

      // Click back button (has chevron-left icon)
      const backButton = wrapper.find('button[title="Back"]');
      await backButton.trigger('click');
      await nextTick();

      // Email field should be visible again
      expect(wrapper.find('input[type="email"]').isVisible()).toBe(true);
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when eye icon is clicked', async () => {
      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // Navigate to password step
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      const continueButton = wrapper.findAll('button[type="button"]')[0]!;
      await continueButton.trigger('click');
      await nextTick();

      const passwordInput = wrapper.find('input[autocomplete="current-password"]');
      expect(passwordInput.attributes('type')).toBe('password');

      // Find and click the eye icon button (nested inside password field)
      const eyeButton = wrapper.find('button[aria-pressed="false"]');
      await eyeButton.trigger('click');
      await nextTick();

      // Password should now be visible as text
      const passwordInputAfter = wrapper.find('input[autocomplete="current-password"]');
      expect(passwordInputAfter.attributes('type')).toBe('text');
    });
  });

  describe('Password Login', () => {
    it('should successfully login with valid credentials', async () => {
      registerEndpoint('/api/auth/login', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // Fill in email
      await wrapper.find('input[type="email"]').setValue('test@example.com');

      // Go to password step
      const continueButton = wrapper.findAll('button[type="button"]')[0]!;
      await continueButton.trigger('click');
      await nextTick();

      // Fill in password
      await wrapper.find('input[autocomplete="current-password"]').setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(addToastMock).toHaveBeenCalledWith({
        title: 'auth.login.success',
        color: 'success',
      });
    });

    it('should show error toast on failed login', async () => {
      registerEndpoint('/api/auth/login', () => {
        return new Response('Unauthorized', { status: 401 });
      });

      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // Fill in credentials
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      const continueButton = wrapper.findAll('button[type="button"]')[0]!;
      await continueButton.trigger('click');
      await nextTick();

      await wrapper.find('input[autocomplete="current-password"]').setValue('wrongpassword');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(addToastMock).toHaveBeenCalledWith({
        title: 'auth.login.error',
        color: 'error',
      });
    });

    it('should emit submit event on successful login', async () => {
      registerEndpoint('/api/auth/login', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // Fill in credentials
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      const continueButton = wrapper.findAll('button[type="button"]')[0]!;
      await continueButton.trigger('click');
      await nextTick();

      await wrapper.find('input[autocomplete="current-password"]').setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(wrapper.emitted('submit')).toBeTruthy();
    });

    it('should handle pending state during login', async () => {
      let resolveLogin: (value: Response) => void;
      const loginPromise = new Promise<Response>(resolve => {
        resolveLogin = resolve;
      });

      registerEndpoint('/api/auth/login', () => loginPromise);

      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      const buttons = wrapper.findAllComponents({ name: 'UButton' });

      // Fill in credentials
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      const continueButton = buttons.find(btn => btn.props('label') === 'Continue')!;
      await continueButton.trigger('click');
      await nextTick();

      await wrapper.find('input[autocomplete="current-password"]').setValue('password123');

      const submitButton = buttons.find(btn => btn.props('type') === 'submit')!;

      // Submit form without awaiting
      const submitPromise = wrapper.find('form').trigger('submit.prevent');

      // Give it a tiny bit of time for the pending state to be set
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check that pending state is set during the login
      expect(submitButton.props('loading')).toBe(true);

      // Resolve the login
      resolveLogin!(new Response(null, { status: 200 }));
      await submitPromise;
      await new Promise(resolve => setTimeout(resolve, 200));

      // After completion, pending should be false
      expect(submitButton.props('loading')).toBe(false);
    });
  });

  describe('Passkey Login', () => {
    it('should successfully login with passkey', async () => {
      authenticateMock.mockResolvedValue(undefined);

      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // Fill in email
      await wrapper.find('input[type="email"]').setValue('test@example.com');

      // Click passkey button
      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const passkeyButtonComponent = buttons.find(
        btn => btn.props('label') === 'Login with Passkey',
      )!;
      await passkeyButtonComponent.find('button').trigger('click');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(authenticateMock).toHaveBeenCalledWith('test@example.com');
      expect(addToastMock).toHaveBeenCalledWith({
        title: 'auth.loginSuccess',
        color: 'success',
      });
    });

    it('should show error toast on failed passkey login', async () => {
      const error = {
        message: 'Passkey authentication failed',
        data: {
          message: 'Invalid passkey',
          data: 'Detail error',
        },
      };
      authenticateMock.mockRejectedValue(error);

      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // Fill in email
      await wrapper.find('input[type="email"]').setValue('test@example.com');

      // Click passkey button
      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const passkeyButtonComponent = buttons.find(
        btn => btn.props('label') === 'Login with Passkey',
      )!;
      await passkeyButtonComponent.find('button').trigger('click');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(addToastMock).toHaveBeenCalledWith({
        title: 'Invalid passkey',
        description: 'Detail error',
        color: 'error',
      });
    });

    it('should not attempt passkey login with invalid email', async () => {
      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // Leave email empty
      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const passkeyButtonComponent = buttons.find(
        btn => btn.props('label') === 'Login with Passkey',
      )!;
      await passkeyButtonComponent.find('button').trigger('click');

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(authenticateMock).not.toHaveBeenCalled();
    });

    it('should emit submit event on successful passkey login', async () => {
      authenticateMock.mockResolvedValue(undefined);

      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // Fill in email
      await wrapper.find('input[type="email"]').setValue('test@example.com');

      // Click passkey button
      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const passkeyButtonComponent = buttons.find(
        btn => btn.props('label') === 'Login with Passkey',
      )!;
      await passkeyButtonComponent.find('button').trigger('click');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(wrapper.emitted('submit')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      const emailInput = wrapper.find('input[type="email"]');
      await emailInput.setValue('invalid-email');

      // Try to submit - form validation should prevent submission
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not submit due to validation
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('should validate password minimum length', async () => {
      registerEndpoint('/api/auth/login', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // Fill in email
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      const continueButton = wrapper.findAll('button[type="button"]')[0]!;
      await continueButton.trigger('click');
      await nextTick();

      // Fill in short password
      await wrapper.find('input[autocomplete="current-password"]').setValue('short');

      // Try to submit - form validation should prevent submission
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not submit due to validation
      expect(wrapper.emitted('submit')).toBeFalsy();
    });
  });

  describe('Forgot Password Link', () => {
    it('should display forgot password link with email', async () => {
      const wrapper = await mountSuspended(LoginComponent, { attachTo: document.body });

      // Fill in email and go to password step
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      const continueButton = wrapper.findAll('button[type="button"]')[0]!;
      await continueButton.trigger('click');
      await nextTick();

      // Check if forgot password link exists
      const links = wrapper.findAll('a');
      const forgotPasswordLink = links.find(link =>
        link.attributes('href')?.includes('/auth/forgot-password'),
      );
      expect(forgotPasswordLink?.isVisible()).toBe(true);
      expect(forgotPasswordLink?.attributes('href')).toContain('test@example.com');
    });
  });
});

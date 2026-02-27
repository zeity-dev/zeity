import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { nextTick } from 'vue';
import RegisterComponent from '~/components/auth/register.vue';

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
const registerWebAuthnMock = vi.fn();
const { useWebAuthnMock } = vi.hoisted(() => {
  return {
    useWebAuthnMock: vi.fn(() => ({
      register: registerWebAuthnMock,
    })),
  };
});
mockNuxtImport('useWebAuthn', () => {
  return useWebAuthnMock;
});

describe('Register Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render email and name inputs', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      const slides = wrapper.findAll('.slide');

      expect(slides.length).toBe(2);
      expect(slides[0]!.isVisible()).toBe(true); // Email step visible
      expect(slides[1]!.isVisible()).toBe(false); // Password step hidden

      expect(wrapper.find('input[type="email"]').isVisible()).toBe(true);
      expect(wrapper.find('input[type="text"]').isVisible()).toBe(true);
    });

    it('should render password inputs (hidden initially)', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Both password fields exist in DOM (using v-show)
      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      expect(passwordInputs.length).toBe(2); // password and confirmPassword
      expect(passwordInputs[0]!.exists()).toBe(true);
      expect(passwordInputs[1]!.exists()).toBe(true);

      expect(passwordInputs[0]!.isVisible()).toBe(false);
      expect(passwordInputs[1]!.isVisible()).toBe(false);
    });

    it('should show register with passkey button', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      expect(wrapper.html()).toContain('Register with Passkey');
    });
  });

  describe('Step Navigation', () => {
    it('should transition to password step when continue is clicked', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');

      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const continueButton = buttons.find(btn => btn.props('label') === 'Continue')!;
      await continueButton.find('button').trigger('click');
      await nextTick();

      // Password fields should be visible
      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      expect(passwordInputs[0]!.isVisible()).toBe(true);
    });

    it('should go back to email step when back button is clicked', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      const buttons = wrapper.findAllComponents({ name: 'UButton' });

      // Go to password step
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');
      const continueButton = buttons.find(btn => btn.props('label') === 'Continue')!;
      await continueButton.find('button').trigger('click');
      await nextTick();

      // Click back button
      const backButton = wrapper.find('button[aria-label="Back"]')!;
      await backButton.trigger('click');
      await nextTick();

      // Email field should be visible again
      expect(wrapper.find('input[type="email"]').isVisible()).toBe(true);
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Navigate to password step
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');
      const continueButton = wrapper.findAllComponents({ name: 'UButton' })[0]!;
      await continueButton.trigger('click');
      await nextTick();

      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      const passwordInput = passwordInputs[0];
      expect(passwordInput?.attributes('type')).toBe('password');

      // Find and click the eye icon button for password
      const eyeButtons = wrapper.findAll('button[aria-pressed="false"]');
      await eyeButtons[0]!.trigger('click');
      await nextTick();

      // Password should now be visible as text
      const passwordInputAfter = wrapper.findAll('input[autocomplete="new-password"]')[0];
      expect(passwordInputAfter?.attributes('type')).toBe('text');
    });

    it('should toggle confirm password visibility independently', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Navigate to password step
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');
      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const continueButton = buttons.find(btn => btn.props('label') === 'Continue')!;
      await continueButton.trigger('click');
      await nextTick();

      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      const confirmPasswordInput = passwordInputs[1];
      expect(confirmPasswordInput?.attributes('type')).toBe('password');

      const eyeButtons = wrapper.findAll('button[aria-pressed="false"]');
      await eyeButtons[1]!.trigger('click');
      await nextTick();

      // Confirm password should now be visible as text
      const confirmPasswordInputAfter = wrapper.findAll('input[autocomplete="new-password"]')[1];
      expect(confirmPasswordInputAfter?.attributes('type')).toBe('text');
    });
  });

  describe('Password Registration', () => {
    it('should successfully register with valid credentials', async () => {
      registerEndpoint('/api/auth/register', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in email and name
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');

      // Go to password step
      const continueButton = wrapper.findAllComponents({ name: 'UButton' })[0]!;
      await continueButton.trigger('click');
      await nextTick();

      // Fill in passwords
      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]!.setValue('password123');
      await passwordInputs[1]!.setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(addToastMock).toHaveBeenCalledWith({
        title: 'auth.register.success',
        color: 'success',
      });
    });

    it('should show error when user already exists', async () => {
      registerEndpoint('/api/auth/register', () => {
        return new Response(JSON.stringify({ message: 'User already exists' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in all fields
      await wrapper.find('input[type="email"]').setValue('existing@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');
      const continueButton = wrapper.findAllComponents({ name: 'UButton' })[0];
      await continueButton?.trigger('click');
      await nextTick();

      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('password123');
      await passwordInputs[1]?.setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(addToastMock).toHaveBeenCalledWith({
        title: 'auth.register.userExists',
        color: 'error',
      });
    });

    it('should show generic error on registration failure', async () => {
      registerEndpoint('/api/auth/register', () => {
        return new Response('Internal Server Error', { status: 500 });
      });

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in all fields
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');
      const continueButton = wrapper.findAllComponents({ name: 'UButton' })[0];
      await continueButton?.trigger('click');
      await nextTick();

      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('password123');
      await passwordInputs[1]?.setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(addToastMock).toHaveBeenCalledWith({
        title: 'auth.register.error',
        color: 'error',
      });
    });

    it('should emit submit event on successful registration', async () => {
      registerEndpoint('/api/auth/register', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in all fields
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');
      const continueButton = wrapper.findAllComponents({ name: 'UButton' })[0];
      await continueButton?.trigger('click');
      await nextTick();

      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('password123');
      await passwordInputs[1]?.setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(wrapper.emitted('submit')).toBeTruthy();
    });

    it('should handle pending state during registration', async () => {
      let resolveRegister: (value: Response) => void;
      const registerPromise = new Promise<Response>(resolve => {
        resolveRegister = resolve;
      });

      registerEndpoint('/api/auth/register', () => registerPromise);

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      const buttons = wrapper.findAllComponents({ name: 'UButton' });

      // Fill in all fields
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');
      const continueButton = buttons.find(btn => btn.props('label') === 'Continue')!;
      await continueButton?.trigger('click');
      await nextTick();

      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('password123');
      await passwordInputs[1]?.setValue('password123');

      // Submit form without awaiting
      const submitPromise = wrapper.find('form').trigger('submit.prevent');

      // Give it a tiny bit of time for the pending state to be set
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check that pending state is set
      const submitButton = buttons.find(btn => btn.props('type') === 'submit')!;
      expect(submitButton.props('loading')).toBe(true);

      // Resolve the registration
      resolveRegister!(new Response(null, { status: 200 }));
      await submitPromise;
      await new Promise(resolve => setTimeout(resolve, 200));

      // After completion, pending should be false
      expect(submitButton.props('loading')).toBe(false);
    });
  });

  describe('Passkey Registration', () => {
    it('should successfully register with passkey', async () => {
      registerWebAuthnMock.mockResolvedValue(undefined);

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in email and name
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');

      // Click passkey button
      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const passkeyButtonComponent = buttons.find(
        btn => btn.props('label') === 'Register with Passkey',
      )!;
      await passkeyButtonComponent.find('button').trigger('click');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(registerWebAuthnMock).toHaveBeenCalledWith({
        userName: 'test@example.com',
        displayName: 'Test User',
      });
    });

    it('should emit submit event on successful passkey registration', async () => {
      registerWebAuthnMock.mockResolvedValue(undefined);

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in email and name
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');

      // Click passkey button
      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const passkeyButtonComponent = buttons.find(
        btn => btn.props('label') === 'Register with Passkey',
      )!;
      await passkeyButtonComponent.find('button').trigger('click');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(wrapper.emitted('submit')).toBeTruthy();
    });

    it('should show error toast on failed passkey registration', async () => {
      const error = {
        message: 'Passkey registration failed',
        data: {
          message: 'Invalid data',
          data: {
            issues: [{ message: 'Email is required' }],
          },
        },
      };
      registerWebAuthnMock.mockRejectedValue(error);

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in email and name
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');

      // Click passkey button
      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const passkeyButtonComponent = buttons.find(
        btn => btn.props('label') === 'Register with Passkey',
      )!;
      await passkeyButtonComponent.find('button').trigger('click');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(registerWebAuthnMock).toHaveBeenCalledWith({
        userName: 'test@example.com',
        displayName: 'Test User',
      });
      expect(addToastMock).toHaveBeenCalledWith({
        title: 'Invalid data',
        description: 'Email is required',
        color: 'error',
      });
    });

    it('should not attempt passkey registration with invalid data', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Leave fields empty
      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const passkeyButtonComponent = buttons.find(
        btn => btn.props('label') === 'Register with Passkey',
      )!;
      await passkeyButtonComponent.find('button').trigger('click');

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(registerWebAuthnMock).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      const emailInput = wrapper.find('input[type="email"]');
      await emailInput.setValue('invalid-email');
      await wrapper.find('input[type="text"]').setValue('Test User');

      // Try to submit - form validation should prevent submission
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not submit due to validation
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('should validate name is required', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      await wrapper.find('input[type="email"]').setValue('test@example.com');
      // Leave name empty

      // Try to submit - form validation should prevent submission
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not submit due to validation
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('should validate password minimum length', async () => {
      registerEndpoint('/api/auth/register', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in email and name
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');
      const continueButton = wrapper.findAllComponents({ name: 'UButton' })[0];
      await continueButton?.trigger('click');
      await nextTick();

      // Fill in short password
      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('short');
      await passwordInputs[1]?.setValue('short');

      // Try to submit - form validation should prevent submission
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not submit due to validation
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('should validate passwords match', async () => {
      registerEndpoint('/api/auth/register', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in email and name
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[type="text"]').setValue('Test User');
      const continueButton = wrapper.findAllComponents({ name: 'UButton' })[0];
      await continueButton?.trigger('click');
      await nextTick();

      // Fill in mismatched passwords
      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('password123');
      await passwordInputs[1]?.setValue('different456');

      // Try to submit - form validation should prevent submission
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not submit due to password mismatch
      expect(wrapper.emitted('submit')).toBeFalsy();
    });
  });
});

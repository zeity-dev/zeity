import { nextTick } from 'vue';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterComponent from '~/components/auth/register.vue';
import type { UButton } from '#components';

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

      // Use data-testid selectors
      expect(wrapper.find('[data-testid="email-input"]').isVisible()).toBe(true);
      expect(wrapper.find('[data-testid="name-input"]').isVisible()).toBe(true);
    });

    it('should render password inputs (hidden initially)', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Both password fields exist in DOM (using v-show)
      expect(wrapper.find('[data-testid="password-input"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="confirm-password-input"]').exists()).toBe(true);

      expect(wrapper.find('[data-testid="password-input"]').isVisible()).toBe(false);
      expect(wrapper.find('[data-testid="confirm-password-input"]').isVisible()).toBe(false);
    });

    it('should show register with passkey button', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      const passkeyButton = wrapper.find('[data-testid="passkey-button"]');

      expect(passkeyButton.exists()).toBe(true);
      expect(passkeyButton.isVisible()).toBe(true);
    });
  });

  describe('Step Navigation', () => {
    it('should transition to password step when continue is clicked', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');

      const continueButton = wrapper.find('[data-testid="continue-button"]');
      await continueButton.trigger('click');
      await nextTick();

      // Password fields should be visible
      expect(wrapper.find('[data-testid="password-input"]').isVisible()).toBe(true);
    });

    it('should go back to email step when back button is clicked', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Go to password step
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');
      const continueButton = wrapper.find('[data-testid="continue-button"]');
      await continueButton.trigger('click');
      await nextTick();

      // Click back button
      const backButton = wrapper.find('[data-testid="back-button"]');
      await backButton.trigger('click');
      await nextTick();

      // Email field should be visible again
      expect(wrapper.find('[data-testid="email-input"]').isVisible()).toBe(true);
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Navigate to password step
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');
      const continueButton = wrapper.find('[data-testid="continue-button"]');
      await continueButton.trigger('click');
      await nextTick();

      // Find password input by autocomplete attribute
      let passwordInput = wrapper.find('input[autocomplete="new-password"]');
      expect(passwordInput.attributes('type')).toBe('password');

      // Click the eye icon button for password
      const eyeButton = wrapper.find('[data-testid="password-visibility-toggle"]');
      await eyeButton.trigger('click');
      await nextTick();

      // Password should now be visible as text
      passwordInput = wrapper.find('input[autocomplete="new-password"]');
      expect(passwordInput.attributes('type')).toBe('text');
    });

    it('should toggle confirm password visibility independently', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body })!;

      // Navigate to password step
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');
      const continueButton = wrapper.find('[data-testid="continue-button"]');
      await continueButton.trigger('click');
      await nextTick();

      // Find both password inputs
      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      const confirmPasswordInput = passwordInputs[1]!;
      expect(confirmPasswordInput.attributes('type')).toBe('password');

      // Click the eye icon button for confirm password
      const eyeButton = wrapper.find('[data-testid="confirm-password-visibility-toggle"]');
      await eyeButton.trigger('click');
      await nextTick();

      // Confirm password should now be visible as text
      expect(wrapper.findAll('input[autocomplete="new-password"]')[1]!.attributes('type')).toBe(
        'text',
      );
    });
  });

  describe('Password Registration', () => {
    it('should successfully register with valid credentials', async () => {
      registerEndpoint('/api/auth/register', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in email and name
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');

      // Go to password step
      const continueButton = wrapper.find('[data-testid="continue-button"]');
      await continueButton.trigger('click');
      await nextTick();

      // Fill in passwords
      await wrapper.find('[data-testid="password-input"]').setValue('password123');
      await wrapper.find('[data-testid="confirm-password-input"]').setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

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
      await wrapper.find('[data-testid="email-input"]').setValue('existing@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');
      const continueButton = wrapper.find('[data-testid="continue-button"]');
      await continueButton.trigger('click');
      await nextTick();

      await wrapper.find('[data-testid="password-input"]').setValue('password123');
      await wrapper.find('[data-testid="confirm-password-input"]').setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

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
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');
      const continueButton = wrapper.find('[data-testid="continue-button"]');
      await continueButton.trigger('click');
      await nextTick();

      await wrapper.find('[data-testid="password-input"]').setValue('password123');
      await wrapper.find('[data-testid="confirm-password-input"]').setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

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
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');
      const continueButton = wrapper.find('[data-testid="continue-button"]');
      await continueButton.trigger('click');
      await nextTick();

      await wrapper.find('[data-testid="password-input"]').setValue('password123');
      await wrapper.find('[data-testid="confirm-password-input"]').setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

      expect(wrapper.emitted('submit')).toBeTruthy();
    });

    it('should handle pending state during registration', async () => {
      let resolveRegister: (value: Response) => void;
      const registerPromise = new Promise<Response>(resolve => {
        resolveRegister = resolve;
      });

      registerEndpoint('/api/auth/register', () => registerPromise);

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in all fields
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');
      const continueButton = wrapper.find('[data-testid="continue-button"]');
      await continueButton.trigger('click');
      await nextTick();

      await wrapper.find('[data-testid="password-input"]').setValue('password123');
      await wrapper.find('[data-testid="confirm-password-input"]').setValue('password123');

      // Submit form without awaiting
      const submitPromise = wrapper.find('form').trigger('submit.prevent');

      // Give it a tiny bit of time for the pending state to be set
      await flushPromises();

      // Check that pending state is set
      const submitButton = wrapper.findComponent<typeof UButton>('[data-testid="submit-button"]')!;
      expect(submitButton.props('loading')).toBe(true);

      // Resolve the registration
      resolveRegister!(new Response(null, { status: 200 }));
      await submitPromise;
      await flushPromises();

      // After completion, pending should be false
      expect(wrapper.findComponent<typeof UButton>('[data-testid="submit-button"]').props('loading')).toBe(false);
    });
  });

  describe('Passkey Registration', () => {
    it('should successfully register with passkey', async () => {
      registerWebAuthnMock.mockResolvedValue(undefined);

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in email and name
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');

      // Click passkey button
      const passkeyButton = wrapper.find('[data-testid="passkey-button"]');
      await passkeyButton.trigger('click');

      // Wait for async operations
      await flushPromises();

      expect(registerWebAuthnMock).toHaveBeenCalledWith({
        userName: 'test@example.com',
        displayName: 'Test User',
      });
    });

    it('should emit submit event on successful passkey registration', async () => {
      registerWebAuthnMock.mockResolvedValue(undefined);

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in email and name
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');

      // Click passkey button
      const passkeyButton = wrapper.find('[data-testid="passkey-button"]');
      await passkeyButton.trigger('click');

      // Wait for async operations
      await flushPromises();

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
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');

      // Click passkey button
      const passkeyButton = wrapper.find('[data-testid="passkey-button"]');
      await passkeyButton.trigger('click');

      // Wait for async operations
      await flushPromises();

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
      const passkeyButton = wrapper.find('[data-testid="passkey-button"]');
      await passkeyButton.trigger('click');

      // Wait a bit
      await flushPromises();

      expect(registerWebAuthnMock).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      const emailInput = wrapper.find('[data-testid="email-input"]');
      await emailInput.setValue('invalid-email');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');

      // Try to submit - form validation should prevent submission
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await flushPromises();

      // Should not submit due to validation
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('should validate name is required', async () => {
      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      // Leave name empty

      // Try to submit - form validation should prevent submission
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await flushPromises();

      // Should not submit due to validation
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('should validate password minimum length', async () => {
      registerEndpoint('/api/auth/register', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in email and name
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');
      const continueButton = wrapper.find('[data-testid="continue-button"]');
      await continueButton.trigger('click');
      await nextTick();

      // Fill in short password
      await wrapper.find('[data-testid="password-input"]').setValue('short');
      await wrapper.find('[data-testid="confirm-password-input"]').setValue('short');

      // Try to submit - form validation should prevent submission
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await flushPromises();

      // Should not submit due to validation
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('should validate passwords match', async () => {
      registerEndpoint('/api/auth/register', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(RegisterComponent, { attachTo: document.body });

      // Fill in email and name
      await wrapper.find('[data-testid="email-input"]').setValue('test@example.com');
      await wrapper.find('[data-testid="name-input"]').setValue('Test User');
      const continueButton = wrapper.find('[data-testid="continue-button"]');
      await continueButton.trigger('click');
      await nextTick();

      // Fill in mismatched passwords
      await wrapper.find('[data-testid="password-input"]').setValue('password123');
      await wrapper.find('[data-testid="confirm-password-input"]').setValue('different456');

      // Try to submit - form validation should prevent submission
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait a bit
      await flushPromises();

      // Should not submit due to password mismatch
      expect(wrapper.emitted('submit')).toBeFalsy();
    });
  });
});

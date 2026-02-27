import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { nextTick } from 'vue';
import { readBody } from 'h3';
import VerifyComponent from '~/components/auth/verify.vue';

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

// Mock console.error to avoid cluttering test output
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Verify Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render pin input field with 6 inputs', async () => {
      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // UPinInput renders as 6 individual input fields
      const inputs = wrapper.findAll('input[autocomplete="one-time-code"]');
      expect(inputs.length).toBe(6);
    });

    it('should render verify button', async () => {
      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.isVisible()).toBe(true);
      expect(submitButton.text()).toContain('user.verify');
    });

    it('should render resend verification button', async () => {
      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      const buttons = wrapper.findAll('button');
      const resendButton = buttons.find(btn => btn.text().includes('user.resendVerification'));
      expect(resendButton?.isVisible()).toBe(true);
    });
  });

  describe('Code Verification', () => {
    it('should successfully verify with valid code', async () => {
      registerEndpoint('/api/user/verify', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // Set the verification code
      const input = wrapper.findComponent({ name: 'UPinInput' });
      await input.vm.$emit('update:modelValue', ['1', '2', '3', '4', '5', '6']);

      await nextTick();

      // Submit form
      await wrapper.find('form').trigger('submit');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(addToastMock).toHaveBeenCalledWith({
        color: 'success',
        title: 'user.verificationSuccess',
      });
    });

    it('should emit submit event on successful verification', async () => {
      registerEndpoint('/api/user/verify', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // Set the verification code
      const input = wrapper.findComponent({ name: 'UPinInput' });
      await input.vm.$emit('update:modelValue', ['1', '2', '3', '4', '5', '6']);

      await nextTick();

      // Submit form
      await wrapper.find('form').trigger('submit');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(wrapper.emitted('submit')).toBeTruthy();
    });

    it('should show error toast on verification failure', async () => {
      registerEndpoint('/api/user/verify', () => {
        return new Response('Invalid code', { status: 400 });
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // Set the verification code
      const input = wrapper.findComponent({ name: 'UPinInput' });
      await input.vm.$emit('update:modelValue', ['1', '2', '3', '4', '5', '6']);

      await nextTick();

      // Submit form
      await wrapper.find('form').trigger('submit');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(addToastMock).toHaveBeenCalledWith({
        color: 'error',
        title: 'user.verificationError',
      });
    });

    it('should not emit submit event on verification failure', async () => {
      registerEndpoint('/api/user/verify', () => {
        return new Response('Invalid code', { status: 400 });
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // Set the verification code
      const input = wrapper.findComponent({ name: 'UPinInput' });
      await input.vm.$emit('update:modelValue', ['1', '2', '3', '4', '5', '6']);

      await nextTick();

      // Submit form
      await wrapper.find('form').trigger('submit');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('should send code as joined string to API', async () => {
      let requestBody: any;
      registerEndpoint('/api/user/verify', async event => {
        // In H3, we use readBody to read the request body
        requestBody = await readBody(event);
        return { success: true };
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // Set the verification code
      const input = wrapper.findComponent({ name: 'UPinInput' });
      await input.vm.$emit('update:modelValue', ['1', '2', '3', '4', '5', '6']);

      await nextTick();

      // Submit form
      await wrapper.find('form').trigger('submit');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(requestBody).toEqual({ code: '123456' });
    });
  });

  describe('Resend Verification', () => {
    it('should successfully resend verification code', async () => {
      registerEndpoint('/api/user/resend-verification', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // Click resend button
      const buttons = wrapper.findAll('button');
      const resendButton = buttons.find(btn => btn.text().includes('user.resendVerification'));
      await resendButton?.trigger('click');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(addToastMock).toHaveBeenCalledWith({
        color: 'success',
        title: 'user.resendVerificationSuccess',
      });
    });

    it('should show error toast on resend failure', async () => {
      registerEndpoint('/api/user/resend-verification', () => {
        return new Response('Error', { status: 500 });
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // Click resend button
      const buttons = wrapper.findAll('button');
      const resendButton = buttons.find(btn => btn.text().includes('user.resendVerification'));
      await resendButton?.trigger('click');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(addToastMock).toHaveBeenCalledWith({
        color: 'error',
        title: 'user.resendVerificationError',
      });
    });

    it('should not emit submit event when resending', async () => {
      registerEndpoint('/api/user/resend-verification', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // Click resend button
      const buttons = wrapper.findAll('button');
      const resendButton = buttons.find(btn => btn.text().includes('user.resendVerification'));
      await resendButton?.trigger('click');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      // Resend should not emit submit
      expect(wrapper.emitted('submit')).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should validate code length is 6 digits', async () => {
      registerEndpoint('/api/user/verify', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // Set incomplete code (only 4 digits)
      const input = wrapper.findComponent({ name: 'UPinInput' });
      await input.vm.$emit('update:modelValue', ['1', '2', '3', '4']);
      await nextTick();

      // Try to submit
      await wrapper.find('form').trigger('submit');
      await nextTick();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not submit due to validation
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('should validate each digit is a single character', async () => {
      registerEndpoint('/api/user/verify', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      const input = wrapper.findComponent({ name: 'UPinInput' });

      // Try to set invalid code with multi-character strings
      await input.vm.$emit('update:modelValue', ['12', '34', '56', '78', '90', '11']);

      await nextTick();

      // Try to submit
      await wrapper.find('form').trigger('submit');
      await nextTick();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not submit due to validation
      expect(wrapper.emitted('submit')).toBeFalsy();
    });

    it('should accept valid 6-digit code', async () => {
      registerEndpoint('/api/user/verify', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // Set valid 6-digit code
      const input = wrapper.findComponent({ name: 'UPinInput' });
      await input.vm.$emit('update:modelValue', ['1', '2', '3', '4', '5', '6']);

      await nextTick();

      // Submit form
      await wrapper.find('form').trigger('submit');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should successfully submit
      expect(wrapper.emitted('submit')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should log errors to console on verification failure', async () => {
      registerEndpoint('/api/user/verify', () => {
        return new Response('Verification failed', { status: 400 });
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // Set the verification code
      const input = wrapper.findComponent({ name: 'UPinInput' });
      await input.vm.$emit('update:modelValue', ['1', '2', '3', '4', '5', '6']);

      await nextTick();

      // Submit form
      await wrapper.find('form').trigger('submit');
      await nextTick();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log errors to console on resend failure', async () => {
      registerEndpoint('/api/user/resend-verification', () => {
        return new Response('Resend failed', { status: 400 });
      });

      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      // Click resend button
      const buttons = wrapper.findAll('button');
      const resendButton = buttons.find(btn => btn.text().includes('user.resendVerification'));
      await resendButton?.trigger('click');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should initialize with empty code array', async () => {
      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      const input = wrapper.findComponent({ name: 'UPinInput' });
      expect(input.isVisible()).toBe(true);
      expect(input.props('modelValue')).toEqual([]);
    });

    it('should update code state when pin input changes', async () => {
      const wrapper = await mountSuspended(VerifyComponent, { attachTo: document.body });

      const input = wrapper.findComponent({ name: 'UPinInput' });
      input.vm.$emit('update:modelValue', ['1', '2', '3', '4', '5', '6']);

      await nextTick();

      expect(input.props('modelValue')).toEqual(['1', '2', '3', '4', '5', '6']);
    });
  });
});

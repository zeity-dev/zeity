import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { readBody } from 'h3';

import JoinPage from '~/pages/organisations/join.vue';

// Mock useToast
const addToastMock = vi.fn();
mockNuxtImport('useToast', () => {
  return () => ({
    add: addToastMock,
  });
});

// Mock useUserSession
mockNuxtImport('useUserSession', () => {
  return () => ({
    loggedIn: ref(true),
    clear: vi.fn(),
    fetch: vi.fn(),
    user: ref({ id: 'user-1', email: 'john@example.com' }),
  });
});

// Mock useRoute - each test uses a unique token to avoid useFetch caching
const routeQueryMock = ref<Record<string, string>>({ token: 'test-token' });
mockNuxtImport('useRoute', () => {
  return () => ({
    query: routeQueryMock.value,
    fullPath: '/organisations/join',
  });
});

// Mock navigateTo
const navigateToMock = vi.hoisted(() => vi.fn());
mockNuxtImport('navigateTo', () => {
  return navigateToMock;
});

// Mock useAuthRedirect (used by auth middleware)
mockNuxtImport('useAuthRedirect', () => {
  return () => ({
    set: vi.fn(),
    has: vi.fn(() => false),
    redirect: vi.fn(),
  });
});

// Register auth session endpoint
registerEndpoint('/api/_auth/session', () => {
  return { user: { id: 'user-1', email: 'john@example.com' } };
});

// Dynamic handlers - overridden per test
let getHandler: () => any;
let postHandler: ((event: any) => any) | null = null;

registerEndpoint('/api/organisation/join-request', event => {
  if (event.method === 'POST' && postHandler) {
    return postHandler(event);
  }
  return getHandler();
});

let testCounter = 0;

describe('Join Organisation Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use unique token per test to bust useFetch cache
    testCounter++;
    routeQueryMock.value = { token: `token-${testCounter}` };
    postHandler = null;
    getHandler = () => ({
      organisation: { id: 'org-1', name: 'Test Org', image: null },
      isMember: false,
      requested: false,
    });
  });

  describe('initial rendering', () => {
    it('should show organisation name when token is valid', async () => {
      const wrapper = await mountSuspended(JoinPage);

      expect(wrapper.text()).toContain('Test Org');
    });

    it('should show join button when user can apply', async () => {
      const wrapper = await mountSuspended(JoinPage);

      const buttons = wrapper.findAllComponents({ name: 'UButton' });

      const joinButton = buttons.find(b => b.props('icon') === 'i-lucide-send');

      expect(joinButton?.exists()).toBe(true);
    });

    it('should show error alert when token is invalid', async () => {
      getHandler = () => new Response('Invalid token', { status: 400 });

      const wrapper = await mountSuspended(JoinPage);
      const alert = wrapper.findComponent({ name: 'UAlert' });

      expect(alert.exists()).toBe(true);
      expect(alert.props('icon')).toBe('i-lucide-x-circle');
    });

    it('should show already member alert when user is a member', async () => {
      getHandler = () => ({
        organisation: { id: 'org-1', name: 'Test Org', image: null },
        isMember: true,
        requested: false,
      });

      const wrapper = await mountSuspended(JoinPage);
      const alert = wrapper.findComponent({ name: 'UAlert' });

      expect(alert.exists()).toBe(true);
      expect(alert.props('icon')).toBe('i-lucide-user-check');
      expect(alert.text()).toContain('You are already a member of this organisation');
    });

    it('should show pending request alert when already requested', async () => {
      getHandler = () => ({
        organisation: { id: 'org-1', name: 'Test Org', image: null },
        isMember: false,
        requested: true,
      });

      const wrapper = await mountSuspended(JoinPage);
      const alert = wrapper.findComponent({ name: 'UAlert' });

      expect(alert.exists()).toBe(true);
      expect(alert.props('icon')).toBe('i-lucide-clock');
      expect(alert.text()).toContain('You have already sent a join request to this organisation.');
    });

    it('should show back button when user cannot apply', async () => {
      getHandler = () => ({
        organisation: { id: 'org-1', name: 'Test Org', image: null },
        isMember: true,
        requested: false,
      });

      const wrapper = await mountSuspended(JoinPage);
      const buttons = wrapper.findAllComponents({ name: 'UButton' });

      const backButton = buttons.find(b => b.props('icon') === 'i-lucide-chevron-left');
      expect(backButton?.exists()).toBe(true);
      expect(backButton?.text()).toBe('Back');
    });
  });

  describe('join request submission', () => {
    it('should send POST request with token when clicking join', async () => {
      let requestBody: any;
      const token = routeQueryMock.value.token;

      postHandler = async event => {
        requestBody = await readBody(event);
        return { id: '1234', status: 'pending' };
      };

      const wrapper = await mountSuspended(JoinPage);

      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const joinButton = buttons.find(b => b.props('icon') === 'i-lucide-send');
      expect(joinButton?.exists()).toBe(true);

      await joinButton!.find('button').trigger('click');
      await nextTick();
      await flushPromises();

      expect(requestBody).toEqual({
        token,
        message: '',
      });
    });

    it('should show success toast and navigate on successful request', async () => {
      postHandler = () => ({ id: '1234', status: 'pending' });

      const wrapper = await mountSuspended(JoinPage);

      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const joinButton = buttons.find(b => b.props('icon') === 'i-lucide-send');

      await joinButton!.find('button').trigger('click');
      await nextTick();
      await flushPromises();

      expect(addToastMock).toHaveBeenCalledWith(expect.objectContaining({ color: 'success' }));
      expect(navigateToMock).toHaveBeenCalledWith('/user');
    });

    it('should show error toast on failed join request', async () => {
      postHandler = () => new Response('Already requested', { status: 400 });

      const wrapper = await mountSuspended(JoinPage);

      const buttons = wrapper.findAllComponents({ name: 'UButton' });
      const joinButton = buttons.find(b => b.props('icon') === 'i-lucide-send');

      await joinButton!.find('button').trigger('click');
      await nextTick();
      await flushPromises();

      expect(addToastMock).toHaveBeenCalledWith({
        color: 'error',
        description: 'Error sending join request',
        title: 'Error',
      });
      expect(navigateToMock).not.toHaveBeenCalled();
    });
  });
});

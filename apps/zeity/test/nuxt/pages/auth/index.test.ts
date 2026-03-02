import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import AuthPage from '~/pages/auth/index.vue';

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

// Mock useUser
const reloadUserMock = vi.fn();
const fetchUserMock = vi.fn();
const resetUserMock = vi.fn();
mockNuxtImport('useUser', () => {
  return () => ({
    reloadUser: reloadUserMock,
    fetchUser: fetchUserMock,
    reset: resetUserMock,
  });
});

// Mock useOrganisation
const currentOrganisationIdRef = ref(null);
mockNuxtImport('useOrganisation', () => {
  return () => ({
    currentOrganisationId: currentOrganisationIdRef,
    setCurrentOrganisationId: vi.fn(),
    getAllOrganisations: () => ({ value: [] }),
    findOrganisationById: () => ({ value: null }),
  });
});

// Mock useAuthRedirect
const authRedirectHasMock = vi.fn();
const authRedirectRedirectMock = vi.fn();
mockNuxtImport('useAuthRedirect', () => {
  return () => ({
    has: authRedirectHasMock,
    redirect: authRedirectRedirectMock,
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
const routeQueryMock = { value: {} };
mockNuxtImport('useRoute', () => {
  return () => ({
    query: routeQueryMock.value,
  });
});

// Mock useRouter
const routerPushMock = vi.fn();
mockNuxtImport('useRouter', () => {
  return () => ({
    push: routerPushMock,
    replace: vi.fn().mockResolvedValue(undefined),
    resolve: vi.fn((to: any) => ({ href: typeof to === 'string' ? to : to.path || '/' })),
    afterEach: vi.fn((_callback: any) => () => {}), // Return unsubscribe function
    beforeEach: vi.fn((_callback: any) => () => {}),
    beforeResolve: vi.fn((_callback: any) => () => {}),
    onError: vi.fn((_callback: any) => () => {}),
  });
});

// Mock WebAuthn
const authenticateMock = vi.fn();
const registerWebAuthnMock = vi.fn();
const { useWebAuthnMock } = vi.hoisted(() => {
  return {
    useWebAuthnMock: vi.fn(() => ({
      authenticate: authenticateMock,
      register: registerWebAuthnMock,
    })),
  };
});
mockNuxtImport('useWebAuthn', () => useWebAuthnMock);

// Register the auth session endpoint that nuxt-auth-utils calls during initialization
registerEndpoint('/api/_auth/session', () => {
  return { user: null };
});

describe('Auth Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    routeQueryMock.value = {};
    userSessionUserRef.value = null;
    loggedInRef.value = false;
    fetchMock.mockResolvedValue(undefined);
    authRedirectHasMock.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    it('should render auth card with login tab by default', async () => {
      const wrapper = await mountSuspended(AuthPage, {
        global: {
          mocks: {
            $t: (key: string) => key,
          },
        },
      });

      expect(wrapper.findComponent({ name: 'UPageCard' }).props('title')).toBe('auth.title');
      expect(wrapper.findComponent({ name: 'AuthLogin' }).exists()).toBe(true);
    });

    it('should render both login and register tabs', async () => {
      const wrapper = await mountSuspended(AuthPage);

      const tabs = wrapper.findComponent({ name: 'UTabs' });
      const items = tabs.props('items');

      expect(items).toEqual([
        { label: 'auth.login.title', slot: 'login', value: 'login', icon: 'i-lucide-log-in' },
        {
          label: 'auth.register.title',
          slot: 'register',
          value: 'register',
          icon: 'i-lucide-user-plus',
        },
      ]);
    });

    it('should show login tab by default', async () => {
      const wrapper = await mountSuspended(AuthPage);

      await nextTick();

      expect(wrapper.findComponent({ name: 'AuthLogin' }).isVisible()).toBe(true);
      expect(wrapper.findComponent({ name: 'AuthRegister' }).exists()).toBe(false);
    });

    it('should show register tab when query param is set', async () => {
      routeQueryMock.value = { tab: 'register' };

      const wrapper = await mountSuspended(AuthPage);

      await nextTick();

      expect(wrapper.findComponent({ name: 'AuthRegister' }).isVisible()).toBe(true);
    });
  });

  describe('Tab Switching', () => {
    it('should switch to register tab when clicked', async () => {
      const wrapper = await mountSuspended(AuthPage);

      // Trigger the tab switch via UTabs modelValue update
      const utabs = wrapper.findComponent({ name: 'UTabs' });
      await utabs.vm.$emit('update:modelValue', 'register');
      await nextTick();

      expect(routerPushMock).toHaveBeenCalledWith({
        path: '/auth',
        query: { tab: 'register' },
      });
    });

    it('should switch to login tab when clicked', async () => {
      routeQueryMock.value = { tab: 'register' };

      const wrapper = await mountSuspended(AuthPage);

      // Trigger the tab switch via UTabs modelValue update
      const utabs = wrapper.findComponent({ name: 'UTabs' });
      await utabs.vm.$emit('update:modelValue', 'login');
      await nextTick();

      expect(routerPushMock).toHaveBeenCalledWith({
        path: '/auth',
        query: { tab: 'login' },
      });
    });
  });

  describe('Authentication Flow', () => {
    it('should call fetch and redirect after successful login', async () => {
      fetchMock.mockResolvedValue(undefined);
      reloadUserMock.mockResolvedValue({
        user: { emailVerified: true },
        organisations: [{ id: 1 }],
      });

      registerEndpoint('/api/auth/login', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(AuthPage);

      // Fill in login form
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[autocomplete="current-password"]').setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

      expect(fetchMock).toHaveBeenCalled();
      expect(reloadUserMock).toHaveBeenCalled();
      expect(navigateToMock).toHaveBeenCalledWith('/user');
    });

    it('should redirect to verify page if email not verified', async () => {
      fetchMock.mockResolvedValue(undefined);
      reloadUserMock.mockResolvedValue({
        user: { emailVerified: false },
        organisations: [{ id: 1 }],
      });

      registerEndpoint('/api/auth/login', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(AuthPage);

      // Fill in login form
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[autocomplete="current-password"]').setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

      expect(navigateToMock).toHaveBeenCalledWith('/user/verify');
    });

    it('should redirect to auth redirect target if set', async () => {
      fetchMock.mockResolvedValue(undefined);
      reloadUserMock.mockResolvedValue({
        user: { emailVerified: true },
        organisations: [{ id: 1 }],
      });
      authRedirectHasMock.mockReturnValue(true);
      authRedirectRedirectMock.mockReturnValue(Promise.resolve());

      registerEndpoint('/api/auth/login', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(AuthPage);

      // Fill in login form
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[autocomplete="current-password"]').setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

      expect(authRedirectRedirectMock).toHaveBeenCalled();
    });

    it('should redirect to create organisation if no organisations', async () => {
      fetchMock.mockResolvedValue(undefined);
      reloadUserMock.mockResolvedValue({
        user: { emailVerified: true },
        organisations: [],
      });

      registerEndpoint('/api/auth/login', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(AuthPage);

      // Fill in login form
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[autocomplete="current-password"]').setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

      expect(navigateToMock).toHaveBeenCalledWith('/organisations/create');
    });

    it('should show error toast on authentication failure', async () => {
      const error = {
        message: 'Authentication failed',
        data: {
          message: 'Invalid credentials',
          data: 'Please check your credentials',
        },
      };
      fetchMock.mockRejectedValue(error);

      registerEndpoint('/api/auth/login', () => {
        return new Response('Unauthorized', { status: 401 });
      });

      const wrapper = await mountSuspended(AuthPage);

      // Fill in login form
      await wrapper.find('input[type="email"]').setValue('test@example.com');
      await wrapper.find('input[autocomplete="current-password"]').setValue('wrongpassword');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

      expect(addToastMock).toHaveBeenCalledWith({
        title: 'auth.login.error',
        description: undefined,
        color: 'error',
      });
    });
  });

  describe('Registration Flow', () => {
    it('should call fetch and redirect after successful registration', async () => {
      routeQueryMock.value = { tab: 'register' };
      fetchMock.mockResolvedValue(undefined);
      reloadUserMock.mockResolvedValue({
        user: { emailVerified: false },
        organisations: [],
      });

      registerEndpoint('/api/auth/register', () => {
        return new Response(null, { status: 200 });
      });

      const wrapper = await mountSuspended(AuthPage);

      await nextTick();

      // Fill in registration form
      await wrapper.find('input[type="email"]').setValue('newuser@example.com');
      await wrapper.find('input[type="text"]').setValue('New User');

      const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
      await passwordInputs[0]?.setValue('password123');
      await passwordInputs[1]?.setValue('password123');

      // Submit form
      await wrapper.find('form').trigger('submit.prevent');
      await nextTick();

      // Wait for async operations
      await flushPromises();

      expect(fetchMock).toHaveBeenCalled();
      expect(reloadUserMock).toHaveBeenCalled();
      expect(navigateToMock).toHaveBeenCalledWith('/user/verify');
    });
  });
});

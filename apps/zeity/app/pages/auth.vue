<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
});

const toast = useToast();
const { fetch, user } = useUserSession();
const { reloadUser } = useUser();

const route = useRoute();
const router = useRouter();

const active = computed({
  get() {
    return (route.query.tab as string) || 'login';
  },
  set(tab) {
    // Hash is specified here to prevent the page from scrolling to the top
    router.push({
      path: '/auth',
      query: { tab },
    });
  },
});

async function auth() {
  await fetch()
    .then(handleRedirect)
    .catch((error) => {
      toast.add({
        title: error.data?.message || error.message,
        description: error.data?.data?.issues[0]?.message || error.data?.data,
        color: 'error',
      });
    });
}

async function handleRedirect() {
  const { user, organisations } = await reloadUser();
  if (!user.emailVerified) {
    return navigateTo('/user/verify');
  }

  if (useAuthRedirect().has()) {
    return useAuthRedirect().redirect();
  }

  if ((organisations?.length ?? 0) < 1) {
    console.log('No organisations found, redirecting to create organisation');
    return navigateTo('/organisations/create');
  }

  return navigateTo('/user');
}

const items = ref([
  {
    label: $t('auth.login'),
    slot: 'login',
    value: 'login',
    icon: 'i-lucide-log-in',
  },
  {
    label: $t('auth.register'),
    slot: 'register',
    value: 'register',
    icon: 'i-lucide-user-plus',
  },
]);
</script>

<template>
  <div class="my-3 space-y-6">
    <UCard v-if="!user" class="max-w-md m-auto">
      <template #header>
        <h3 class="text-lg font-semibold leading-6">
          {{ $t('auth.title') }}
        </h3>
      </template>

      <div class="flex flex-col gap-2 justify-between">
        <UTabs v-model="active" :items="items">
          <template #login>
            <div class="py-6">
              <AuthLogin @submit="auth" />
            </div>
          </template>
          <template #register>
            <div class="py-6">
              <AuthRegister @submit="auth" />
            </div>
          </template>
        </UTabs>

        <AuthOauth />
      </div>
    </UCard>
  </div>
</template>

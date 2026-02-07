<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const toast = useToast();
const { fetch } = useUserSession();
const { reloadUser } = useUser();

async function refresh() {
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
    return;
  }

  if (useAuthRedirect().has()) {
    return useAuthRedirect().redirect();
  }

  if ((organisations?.length ?? 0) < 1) {
    console.log('No organisations found, redirecting to create organisation');
    return navigateTo('/organisations/create');
  }

  await navigateTo('/user');
}
</script>

<template>
  <div class="my-3 space-y-6">
    <UPageCard :title="$t('auth.verify')">
      <div class="flex flex-col gap-2 justify-between">
        <AuthVerify @submit="refresh" />
      </div>
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});
useHead({
  title: useI18n().t('user.title'),
});

const { fetchUser } = useUser();
const { pending, data } = await fetchUser();
</script>

<template>
  <UDashboardPanel :id="`user-${data?.user.id}`">
    <template #header>
      <UDashboardNavbar :title="$t('user.title')" :toggle="false" />

      <UDashboardToolbar>
        <UNavigationMenu
          :items="[
            { label: $t('navigation.profile'), to: '/user', exact: true },
            { label: $t('user.changePassword.title'), to: '/user/password' },
            {
              label: $t('navigation.organisations'),
              to: '/user/organisations',
            },
          ]"
          highlight
          class="-mx-1 flex-1"
        />
      </UDashboardToolbar>
    </template>

    <template #body>
      <NuxtPage
        :user="data?.user"
        :organisations="data?.organisations"
        :pending="pending"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const appConfig = useRuntimeConfig();

const { isLoggedIn } = useAuth();
const { user } = useUserSession();
const { currentOrganisation, getAllOrganisations, setCurrentOrganisationId } =
  useOrganisation();
const orgItems = computed(() =>
  getAllOrganisations().value.map((organisation) => ({
    label: organisation.name,
    avatar: {
      src: getOrganisationImagePath(organisation),
      alt: organisation.name,
    },
    active: currentOrganisation.value?.id === organisation.id,
    onSelect() {
      setCurrentOrganisationId(organisation.id);
    },
  })),
);
</script>

<template>
  <header
    class="bg-(--ui-bg)/75 backdrop-blur border-b border-(--ui-border) h-(--ui-header-height) sticky top-0 z-50"
    :class="$attrs.class"
  >
    <div
      class="w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 h-full"
    >
      <div class="lg:flex-1 flex items-center gap-1.5 min-w-0">
        <UButton to="/" icon="i-zeity-logo" variant="ghost">
          <span
            class="font-bold text-xl text-neutral-900 dark:text-white min-w-0"
          >
            {{ appConfig.public.appName }}
          </span>
        </UButton>
      </div>
      <div class="flex items-center justify-end lg:flex-1 gap-3">
        <UButton
          v-if="$route.path === '/time'"
          square
          class="rounded-full"
          icon="i-lucide-plus"
          variant="outline"
          to="/time/create"
        >
          <span class="sr-only">
            {{ $t('common.add') }}
          </span>
        </UButton>

        <UAvatarGroup v-if="isLoggedIn && user">
          <UDropdownMenu :items="orgItems">
            <UAvatar
              v-if="currentOrganisation"
              :src="getOrganisationImagePath(currentOrganisation)"
              :alt="currentOrganisation?.name"
            />
          </UDropdownMenu>
          <ULink to="/user" :title="user?.name">
            <UAvatar :src="getUserImagePath(user)" :alt="user?.name" />
          </ULink>
        </UAvatarGroup>
      </div>
    </div>
  </header>
</template>

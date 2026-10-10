<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const systemStore = useSystemStore();

const { t } = useI18n();
const { loading } = useUser();
const { getOrganisationImagePath } = useImagePaths();
const { currentOrganisation, setCurrentOrganisationId, getAllOrganisations } = useOrganisation();
const organisations = getAllOrganisations();

const currentItem = computed(() => {
  if (!currentOrganisation.value) return { label: t('organisations.empty.title') };
  return {
    label: currentOrganisation.value.name,
    avatar: {
      src: getOrganisationImagePath(currentOrganisation.value),
      alt: currentOrganisation.value.name,
    },
  };
});

const userActions = computed(() => {
  const actions: DropdownMenuItem[] = [
    {
      label: t('organisations.manage'),
      icon: 'i-lucide-settings',
      to: '/organisations',
    },
  ];
  if (systemStore.allowOrganisationCreate) {
    actions.push({
      label: t('organisations.create'),
      icon: 'i-lucide-circle-plus',
      to: '/organisations/create',
    });
  }
  return actions;
});

const organisationItems = computed<DropdownMenuItem[]>(() => {
  const orgs = organisations.value;

  if (!orgs.length) {
    return [
      {
        label: t('organisations.empty.title'),
        icon: 'i-lucide-alert-circle',
        disabled: true,
      },
    ];
  }

  return orgs.map(organisation => ({
    label: organisation.name,
    avatar: {
      src: getOrganisationImagePath(organisation),
      alt: organisation.name,
    },
    active: currentOrganisation.value?.id === organisation.id,
    slot: 'org',
    onSelect() {
      setCurrentOrganisationId(organisation.id);
    },
  }));
});

const items = computed<DropdownMenuItem[][]>(() => {
  return [organisationItems.value, userActions.value];
});
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }"
    size="lg"
  >
    <template #org-trailing="{ active }">
      <UIcon :name="active ? 'i-lucide-circle-check' : 'i-lucide-circle'" class="shrink-0 size-5" />
    </template>

    <UButton
      v-bind="{
        ...currentItem,
        label: collapsed ? undefined : currentItem?.label,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      :loading="loading"
      :ui="{ trailingIcon: 'text-dimmed' }"
      :square="collapsed"
      :class="[!collapsed && 'py-2']"
      color="neutral"
      variant="ghost"
      block
      class="data-[state=open]:bg-elevated"
      size="xl"
    />
  </UDropdownMenu>
</template>

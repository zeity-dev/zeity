<script setup lang="ts">
import UChip from '@nuxt/ui/components/Chip.vue';

const { openMoreMenu, horizontalMenu } = useNavigation();

const route = useRoute();
watch(
  () => route.path,
  () => {
    openMoreMenu.value = false;
  },
);
</script>

<template>
  <div
    class="fixed bottom-0 inset-x-0 flex justify-center pointer-events-none"
    :class="$attrs.class"
  >
    <div
      class="pointer-events-auto rounded-t-xl bg-(--ui-bg) border border-(--ui-border) shadow-md"
    >
      <nav class="relative flex items-center justify-center">
        <ul
          class="isolate min-w-0 flex items-center justify-between gap-2 px-3"
        >
          <li
            v-for="button in horizontalMenu"
            :key="button.label"
            class="relative min-w-20 py-1"
          >
            <ULink
              class="group relative w-full flex flex-1 flex-col items-center gap-0.5 px-2.5 py-1.5 font-medium text-sm before:absolute before:z-[-1] before:rounded-md focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none focus-visible:before:ring-primary before:inset-x-px before:inset-y-0"
              active-class="before:bg-elevated before:bg-elevated"
              :to="button.to"
              @click="button.onSelect"
            >
              <component :is="button.chip ? UChip : 'div'">
                <UIcon :name="button.icon" class="size-6" />
              </component>
              <span class="text-xs truncate">{{ button.label }}</span>
            </ULink>
          </li>
        </ul>
      </nav>
    </div>

    <USlideover v-model:open="openMoreMenu" title="Menu" side="right">
      <template #body>
        <AppAsideNavigation />
      </template>
    </USlideover>
  </div>
</template>

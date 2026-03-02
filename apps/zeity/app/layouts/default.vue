<template>
  <div class="isolate">
    <AppHeader />

    <UContainer>
      <div
        class="grid md:flex md:gap-4 min-h-[calc(100dvh-var(--ui-header-height))] divide-x divide-default"
      >
        <aside
          class="hidden md:block shrink-0 sticky top-(--ui-header-height) max-h-[calc(100vh-var(--ui-header-height))] md:w-44 lg:w-52 xl:w-60 overflow-y-auto py-4"
        >
          <AppAsideNavigation />
        </aside>

        <main class="relative flex flex-col grow min-w-0 pt-2 pb-17 md:py-3">
          <LazyAppHints class="shrink-0" />

          <div class="grow shrink-0">
            <slot />
          </div>
        </main>
      </div>
    </UContainer>

    <AppBottomNavigation class="md:hidden" />
  </div>
</template>

<style>
:root {
  --ui-header-height: calc(var(--spacing) * 16);
}
</style>

<template>
    <div class="isolate">
        <AppHeader />

        <UContainer>
            <div class="grid md:flex md:gap-4 min-h-[calc(100dvh-var(--ui-header-height))] divide-x divide-default">
                <aside
                    class="hidden md:block shrink-0 sticky top-(--ui-header-height) max-h-[calc(100vh-var(--ui-header-height))] md:w-44 lg:w-52 xl:w-60 overflow-y-auto">
                    <AppAsideNavigation />
                </aside>

                <main class="grow shrink min-w-0 pb-17 md:pb-2">
                    <slot />
                </main>
            </div>
        </UContainer>

        <AppBottomNavigation class="md:hidden" />
    </div>
</template>

<style>
:root {
    --ui-header-height: calc(var(--spacing)* 16);
}
</style>

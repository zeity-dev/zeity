<template>
	<header :class="$attrs.class" class="bg-default/75 backdrop-blur border-b border-default h-(--ui-header-height) sticky top-0 z-50">
		<div
			class="flex-1 flex items-center justify-between sm:items-stretch sm:justify-start gap-4 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-16">
			<UButton to="/" icon="i-zeity-logo" variant="link">
				<span class="font-bold text-xl text-neutral-900 dark:text-white min-w-0">
					{{ $t('home.title') }}
				</span>
			</UButton>
			<UNavigationMenu :items="menu" orientation="horizontal" content-orientation="vertical"
				class="hidden md:flex justify-between flex-grow" />

			<UButton class="md:hidden" icon="i-lucide-menu" variant="ghost" color="neutral" square
				@click="openMoreMenu = true" />
		</div>

		<USlideover v-model:open="openMoreMenu" title="Menu" side="right">
			<template #body>
				<div class="flex flex-col justify-center h-full">
					<UNavigationMenu :items="menu" orientation="vertical" class="full-w" />
				</div>
			</template>
		</USlideover>
	</header>
</template>

<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();


const menu = [
	[
		{ label: t('docs.title'), to: localePath('/docs'), icon: 'i-lucide-library-big' },
	],
	[
		{ label: 'GitHub', to: 'https://github.com/zeity-dev/zeity', icon: 'i-ri-github-fill' },
	]
]

const openMoreMenu = ref(false);

const route = useRoute();
watch(() => route.path, () => {
	openMoreMenu.value = false;
});
</script>

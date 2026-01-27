<script setup lang="ts">
import type { PageFeatureProps } from '@nuxt/ui';

const { t } = useI18n();
const localePath = useLocalePath();

const features = ref<PageFeatureProps[]>([
  {
    title: t('home.features.usability.title'),
    description: t('home.features.usability.description'),
    icon: 'i-lucide-check-circle',
  },
  {
    title: t('home.features.customization.title'),
    description: t('home.features.customization.description'),
    icon: 'i-lucide-settings',
  },
  {
    title: t('home.features.team.title'),
    description: t('home.features.team.description'),
    icon: 'i-lucide-users',
  },
  {
    title: t('home.features.projects.title'),
    description: t('home.features.projects.description'),
    icon: 'i-lucide-folder',
  },
  {
    title: t('home.features.reporting.title'),
    description: t('home.features.reporting.description'),
    icon: 'i-lucide-chart-pie',
  },
  {
    title: t('home.features.oss.title'),
    description: t('home.features.oss.description'),
    icon: 'i-ri-open-source-line',
  },
]);

definePageMeta({
  title: 'home.title',
  ogTitle: 'home.title',
  description: 'home.description',
  ogDescription: 'home.description',
});
</script>

<template>
  <UPage>
    <UPageHero
      :title="$t('home.title')"
      :description="$t('home.description')"
      :links="[{ label: $t('home.openDocs'), to: localePath('/docs') }]"
      orientation="horizontal"
    >
      <figure class="relative">
        <DemoTimer />
      </figure>
    </UPageHero>

    <UPageSection
      :title="$t('home.features.title')"
      :description="$t('home.features.description')"
      :features="features"
      icon="i-lucide-rocket"
    />
  </UPage>
</template>

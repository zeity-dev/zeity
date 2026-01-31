<script setup lang="ts">
import z from 'zod';

useHead({
  title: useI18n().t('about.title'),
});

const { t } = useI18n();
const config = useSystemStore();

const linkSchema = z.object({
  to: z.url(),
  label: z.string(),
  icon: z.string().default('i-lucide-globe'),
  target: z.string().default('_blank'),
});

const links = computed(() => {
  const links = parseLinks(config.links);

  if (config?.legal?.privacy) {
    links.push({
      to: config.legal.privacy,
      label: t('about.privacy'),
      icon: 'i-lucide-shield',
      target: '_blank',
    });
  }

  if (config?.legal?.terms) {
    links.push({
      to: config.legal.terms,
      label: t('about.terms'),
      icon: 'i-lucide-file-text',
      target: '_blank',
    });
  }

  return links;
});

function parseLinks(data: unknown) {
  try {
    if (!data) return [];

    if (typeof data === 'string') {
      return parseLinks(JSON.parse(data));
    }

    if (Array.isArray(data)) {
      return data.map(parseLink).filter((item) => !!item);
    }

    const link = parseLink(data);
    if (link) {
      return [link];
    }
  } catch {
    // ignore
  }
  return [];
}
function parseLink(data: unknown) {
  try {
    return linkSchema.parse(data);
  } catch {
    return null;
  }
}
</script>

<template>
  <div class="my-3 space-y-4">
    <div>
      <div class="text-center">
        <AppLogo size="lg" />
      </div>

      <p
        class="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ui-primary)]"
      >
        {{ config.appName }}
      </p>
      <p class="text-center text-pretty">
        {{ $t('about.description') }}
      </p>
    </div>

    <div class="flex justify-between items-center">
      <span> Version </span>
      <div class="flex items-center gap-2">
        <UBadge v-if="config.stage !== 'production'" color="warning">
          {{ config.stage }}
        </UBadge>
        <span class="text-[var(--ui-text-muted)]">
          {{ config.version }}
        </span>
      </div>
    </div>

    <ClientOnly>
      <div
        v-if="$pwa?.isPWAInstalled || $pwa?.showInstallPrompt"
        class="flex justify-between items-center"
      >
        <span> Web App: </span>
        <div class="flex items-center gap-2">
          <UBadge v-if="$pwa?.offlineReady" color="neutral">
            Offline Ready
          </UBadge>
          <UBadge v-if="$pwa?.isPWAInstalled" color="success">
            Installed
          </UBadge>
          <UButton
            v-if="$pwa?.needRefresh"
            variant="soft"
            color="primary"
            icon="i-lucide-refresh-cw"
            label="Update"
            @click="$pwa.updateServiceWorker()"
          />

          <UButton
            v-if="$pwa?.showInstallPrompt && !$pwa?.needRefresh"
            variant="soft"
            color="primary"
            icon="i-lucide-package-plus"
            label="Install"
            class="w-full"
            @click="$pwa.install()"
          />
        </div>
      </div>
    </ClientOnly>

    <div v-if="links.length">
      <USeparator class="mb-6" />
      <UButton
        v-for="link in links"
        :key="link.to"
        :label="link.label"
        :to="link.to"
        :target="link.target || '_blank'"
        :icon="link.icon"
        variant="link"
        color="neutral"
        size="xl"
        class="w-full"
      />
    </div>

    <USeparator />

    <div>
      <UButton
        to="https://github.com/zeity-dev/zeity"
        target="_blank"
        variant="soft"
        color="neutral"
        size="xl"
        icon="i-lucide-github"
        label="Github"
        class="w-full"
      />
    </div>
  </div>
</template>

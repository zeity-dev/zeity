<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    siteName?: string;
  }>(),
  {
    title: 'title',
  },
);

const siteConfig = useSiteConfig();
const siteName = computed(() => {
  return props.siteName || siteConfig.name;
});
</script>

<template>
  <div
    class="w-full h-full flex justify-between relative p-14 bg-zinc-900 text-sky-200"
  >
    <div class="h-full w-full justify-between relative">
      <div class="flex flex-row justify-center items-center p-8">
        <div
          class="flex flex-col w-full justify-center text-balance text-center"
        >
          <h1 class="m-0 mb-4 text-7xl font-semibold">
            {{ title }}
          </h1>
          <p
            v-if="description"
            class="text-center text-4xl leading-tight text-sky-100"
          >
            {{ description }}
          </p>
        </div>
      </div>
      <div
        class="flex flex-row justify-center items-center text-left w-full gap-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 195 196"
          width="60"
          height="60"
        >
          <path
            fill="#00BCFF"
            fill-opacity=".4"
            d="M26.607 6.393C20.749.536 11.25.536 5.393 6.393c-5.857 5.858-5.857 15.356 0 21.214L26.607 6.393Zm33.786 76.214L71 93.213 92.213 72 81.607 61.393 60.393 82.607Zm-55-55 55 55 21.214-21.214-55-55L5.393 27.607ZM133.607 113.393 123 102.787 101.787 124l10.606 10.607 21.214-21.214Zm34.421 76.848c5.858 5.858 15.355 5.858 21.213 0 5.858-5.858 5.858-15.355 0-21.213l-21.213 21.213Zm-55.635-55.634 55.635 55.634 21.213-21.213-55.634-55.635-21.214 21.214Z"
          />
          <path
            stroke="#00BCFF"
            stroke-linecap="round"
            stroke-width="30"
            d="M17 177.706 177.413 17.294M15 181h165M15 15h165"
          />
        </svg>
        <span v-if="siteName" class="font-bold text-5xl text-sky-400">
          {{ siteName }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@zeity/types';

const props = defineProps({
  user: {
    type: Object as PropType<Pick<User, 'image' | 'name'>>,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 64,
  },
  text: {
    type: String,
    default: null,
  },
});

const src = computed(() => {
  return getUserImagePath(props.user);
});

const textSize = computed(() => {
  const size = Math.floor(Number(props.size) / 16);
  switch (size) {
    case 9:
      return 'text-7xl';
    case 8:
      return 'text-6xl';
    case 7:
      return 'text-5xl';
    case 6:
      return 'text-4xl';
    case 5:
      return 'text-3xl';
    case 4:
      return 'text-2xl';
    case 3:
      return 'text-xl';
    case 2:
      return 'text-lg';
    case 1:
      return 'text-base';
    default:
      return 'text-sm';
  }
});

const fallback = computed(
  () =>
    props.text ||
    (props.user.name || '')
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .substring(0, 2),
);

const error = ref(false);

watch(
  () => props.user.image,
  () => {
    if (error.value) {
      error.value = false;
    }
  },
);

function onError() {
  error.value = true;
}
</script>

<template>
  <span
    v-bind="$attrs"
    :style="`height: ${size}px; width: ${size}px;`"
    :class="textSize"
    class="inline-flex items-center justify-center shrink-0 select-none rounded-full align-middle bg-elevated"
  >
    <nuxt-img
      v-if="src && !error"
      :src="src"
      :alt="props.user.name"
      :width="size"
      :height="size"
      class="h-full w-full rounded-[inherit] object-cover"
      @error="onError"
    />

    <span v-else class="font-medium leading-none text-muted truncate">{{
      fallback || '&nbsp;'
    }}</span>
  </span>
</template>

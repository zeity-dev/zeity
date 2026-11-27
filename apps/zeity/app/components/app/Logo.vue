<template>
  <div
    class="inline-block rounded-3xl p-8 m-2 border border-[var(--ui-border)] bg-[var(--ui-bg-accented)] shadow-lg aspect-square"
  >
    <UIcon name="i-zeity-logo" :class="logoClasses" />
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { UIcon } from '#components';

const props = defineProps({
  size: {
    type: String as PropType<'sm' | 'md' | 'lg' | 'xl'>,
    default: 'lg',
  },
});

const sizeClasses = {
  sm: 'size-16',
  md: 'size-24',
  lg: 'size-32',
  xl: 'size-48',
};

const logoClasses = computed(() => {
  return `text-[var(--ui-primary)] ${sizeClasses[props.size]}`;
});
</script>

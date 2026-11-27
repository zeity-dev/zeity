<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <fieldset
    class="border border-dashed hover:border-solid rounded-md border-neutral-300 dark:border-neutral-700 p-3 pt-0 space-y-2"
  >
    <legend class="tracking-wide text-md font-semibold px-2 -ml-2">{{ label }}</legend>

    <slot />
  </fieldset>
</template>

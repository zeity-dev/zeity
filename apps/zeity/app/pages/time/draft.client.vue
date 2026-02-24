<script setup lang="ts">
const draft = storeToRefs(useTimerStore()).draft;
</script>

<template>
  <div class="flex flex-col py-3 my-3 h-full">
    <div v-if="!draft">
      <UAlert
        icon="i-lucide-octagon-alert"
        color="neutral"
        :title="$t('error.notFound.title')"
        :description="$t('error.notFound.description')"
        :actions="[
          {
            label: $t('common.back'),
            to: '/time',
            icon: 'i-lucide-arrow-left',
            size: 'xl',
          },
        ]"
      />
    </div>

    <TimeForm v-if="draft" v-model="draft" class="h-full" />
  </div>
</template>

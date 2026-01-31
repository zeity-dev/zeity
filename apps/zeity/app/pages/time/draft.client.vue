<script setup lang="ts">
const draft = storeToRefs(useTimerStore()).draft;
</script>

<template>
  <div class="grid py-3 my-3">
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

    <TimeForm v-if="draft" v-model="draft" />
  </div>
</template>

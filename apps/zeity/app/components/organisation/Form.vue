<script setup lang="ts">
import { ref, type PropType, watch } from 'vue';
import type { FormSubmitEvent } from '@nuxt/ui';
import { z } from 'zod';
import { UButton, UForm, UFormField, UInput } from '#components';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<Schema>,
    required: true,
  },
});
const emits = defineEmits(['submit']);

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(3).default(''),
});
type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({
  id: undefined,
  name: '',
});

watch(
  props.data,
  data => {
    if (data) {
      state.value = Object.assign({}, data);
    }
  },
  { immediate: true },
);

function handleSubmit(event: FormSubmitEvent<Schema>) {
  emits('submit', event.data);
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="handleSubmit">
    <UFormField :label="$t('organisations.form.name')" name="name">
      <UInput
        v-model="state.name"
        :placeholder="$t('organisations.form.namePlaceholder')"
        class="w-full"
      />
    </UFormField>

    <UButton :loading="loading" block type="submit">
      {{ $t('common.save') }}
    </UButton>
  </UForm>
</template>

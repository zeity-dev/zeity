<script setup lang="ts">
import { ref, type PropType, watch } from 'vue';
import type { FormSubmitEvent } from '@nuxt/ui';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { UButton, UForm, UFormField, UInput, UTextarea } from '#components';
import { PROJECT_STATUSES, PROJECT_STATUS_ACTIVE } from '@zeity/types/project';
import ProjectStatusSelect from '~/components/project/StatusSelect.vue';

const props = defineProps({
  data: {
    type: Object as PropType<Schema>,
    required: true,
  },
});
const emits = defineEmits(['submit']);

const schema = z.object({
  id: z.string().default(nanoid()),
  status: z.enum(PROJECT_STATUSES).default(PROJECT_STATUS_ACTIVE),
  name: z.string().min(3).max(150).default(''),
  notes: z.string().default(''),
});
type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({
  id: undefined,
  status: undefined,
  name: '',
  notes: '',
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
    <UFormField :label="$t('projects.form.name')" name="name">
      <UInput v-model="state.name" class="w-full" />
    </UFormField>
    <UFormField :label="$t('projects.form.status')" name="status">
      <ProjectStatusSelect v-model="state.status" class="w-full" />
    </UFormField>
    <UFormField :label="$t('projects.form.notes')" name="notes">
      <UTextarea v-model="state.notes" class="w-full" autoresize />
    </UFormField>

    <UButton block type="submit">
      {{ $t('common.save') }}
    </UButton>
  </UForm>
</template>

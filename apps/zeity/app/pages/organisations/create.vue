<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { navigateTo } from '#app';
import { UBreadcrumb } from '#components';
import { useToast } from '#imports';
import type { NewOrganisation, Organisation } from '@zeity/types/organisation';
import OrganisationForm from '~/components/organisation/Form.vue';
import { useOrganisation } from '~/composables/organisation';
import { useSystemStore } from '~/stores/systemStore';

const systemStore = useSystemStore();
if (!systemStore.allowOrganisationCreate) {
  await navigateTo('/organisations');
}

const { t } = useI18n();
const toast = useToast();
const { createOrganisation, setCurrentOrganisationId } = useOrganisation();

const loading = ref(false);
const data = ref<NewOrganisation>({
  name: '',
});

async function handleSubmit(data: Organisation | NewOrganisation) {
  loading.value = true;
  const organisation = await createOrganisation(data)
    .then(data => {
      toast.add({
        color: 'success',
        title: t('organisations.createSuccess'),
      });
      if (data?.id) {
        setCurrentOrganisationId(data.id);
      }
      return data;
    })
    .catch(error => {
      console.error(error);
      toast.add({
        color: 'error',
        title: t('organisations.createError'),
      });
    })
    .finally(() => {
      loading.value = false;
    });

  if (organisation) {
    await navigateTo('/organisations/' + organisation.id);
  }
}
</script>

<template>
  <div as="section" class="page my-3">
    <UBreadcrumb :items="[{ label: $t('organisations.title'), to: '/organisations' }]" />
    <h2
      class="inline-block text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200"
    >
      {{ $t('organisations.create') }}
    </h2>

    <OrganisationForm :loading="loading" :data="data" class="mt-4" @submit="handleSubmit" />
  </div>
</template>

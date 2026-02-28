<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const { t } = useI18n();
const { orgId } = useRoute().params as { orgId: string };
const { loading, createOrganisationTeam } = useOrganisation();

const route = useRoute()
const organisationId = computed(() => route.params.orgId as string);

const schema = z.object({
    name: z.string().trim().min(2).max(150),
    description: z.string().optional().default(''),
    permissions: z.array(z.string()).default([]),
    memberIds: z.array(z.string().uuid()).min(1),
});
type Schema = z.output<typeof schema>
const state = ref<Partial<Schema>>({
    name: '',
    description: '',
    permissions: [],
    memberIds: [],
});

function handleSubmit(event: FormSubmitEvent<Schema>) {
    return createOrganisationTeam(orgId, event.data).then(async (data) => {
        useToast().add({
            color: 'success',
            title: t('organisations.teams.createSuccess'),
        });
        await navigateTo(`/organisations/${orgId}/team/${data.id}`);
    }).catch((error) => {
        console.error(error);
        useToast().add({
            color: 'error',
            title: t('organisations.teams.createError'),
        });
    });
}
</script>

<template>
    <div as="section" class="page my-3">
        <h2
            class="inline-block text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200">
            {{ $t('organisations.teams.create') }}
        </h2>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="handleSubmit">
            <UFormField :label="$t('organisations.teams.form.name')" name="name">
                <UInput v-model="state.name" :placeholder="$t('organisations.teams.form.namePlaceholder')"
                    class="w-full" />
            </UFormField>

            <UFormField :label="$t('organisations.teams.form.description')" name="description">
                <UInput v-model="state.description" :placeholder="$t('organisations.teams.form.descriptionPlaceholder')"
                    class="w-full" />
            </UFormField>

            <UFormField :label="$t('organisations.teams.members.title')" name="memberIds" size="xl">
                <OrganisationMemberSelectField v-model="state.memberIds" :organisation-id="organisationId"
                    class="w-full" />
            </UFormField>

            <UButton :loading="loading" block type="submit">
                {{ $t('common.save') }}
            </UButton>
        </UForm>
    </div>
</template>
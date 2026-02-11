<script setup lang="ts">
import z from 'zod'
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { User } from '@zeity/types/user';
import type { OrganisationMemberRole } from '@zeity/types/organisation';

interface TeamMemberData {
    memberId: string;
    userId: string;
    role: OrganisationMemberRole;
    user: User | null;
}

const { t } = useI18n()
const toast = useToast()
const { fetchOrganisationTeam } = useOrganisation()

const addMemberModalOpen = ref(false);
function toggleAddMemberModal() {
    addMemberModalOpen.value = !addMemberModalOpen.value;
}
function cleanupAddMemberModal() {
    addMemberState.value = {
        memberIds: [],
    };
}

const route = useRoute()
const organisationId = computed(() => route.params.orgId as string);
const teamId = computed(() => route.params.teamId as string);

const membersColumns: TableColumn<TeamMemberData>[] = [
    {
        id: 'name',
        accessorKey: 'user.name',
        header: 'Name',
    },
    {
        id: 'action',
    }
];

const team = await fetchOrganisationTeam(organisationId, teamId);
const members = await useFetch(`/api/organisation/${organisationId.value}/team/${teamId.value}/member`);

const saving = ref(false);
const editing = ref(false);

const schema = z.object({
    name: z.string().trim().min(2).max(150),
    description: z.string().optional().default(''),
});
type Schema = z.output<typeof schema>
const state = ref<Partial<Schema>>({
    name: team.data.value?.name ?? '',
    description: team.data.value?.description ?? '',
});

const addMemberSchema = z.object({
    memberIds: z.array(z.string().uuid()).min(1),
})
type AddMemberSchema = z.output<typeof addMemberSchema>
const addMemberState = ref<AddMemberSchema>({
    memberIds: [],
});

function switchEditing() {
    editing.value = !editing.value
    state.value = {
        name: team.data.value?.name ?? '',
        description: team.data.value?.description ?? '',
    }
}

function updateTeamDetails(event: FormSubmitEvent<Schema>) {
    saving.value = true
    return $fetch(`/api/organisation/${organisationId.value}/team/${teamId.value}`, {
        method: 'PATCH',
        body: {
            name: event.data.name,
            description: event.data.description,
        }
    }).then(async () => {
        toast.add({
            color: 'success',
            title: t('organisations.teams.updateSuccess'),
        })
        await team.refresh()
        editing.value = false
    }).catch((error) => {
        console.error(error)
        toast.add({
            color: 'error',
            title: t('organisations.teams.updateError'),
        })
    }).finally(() => {
        saving.value = false
    })
}

function createTeamMembers(event: FormSubmitEvent<AddMemberSchema>) {
    return $fetch(`/api/organisation/${organisationId.value}/team/${teamId.value}/member`, {
        method: 'POST',
        body: {
            memberIds: event.data.memberIds,
        }
    }).then(() => {
        toast.add({
            color: 'success',
            title: t('organisations.teams.members.addSuccess'),
        })
        toggleAddMemberModal();
        return members.refresh();
    }).catch((error) => {
        console.error(error)
        toast.add({
            color: 'error',
            title: t('organisations.teams.members.addError'),
        })
    })
}

function deleteMembers(memberIds: string[]) {
    return $fetch(`/api/organisation/${organisationId.value}/team/${teamId.value}/member`, {
        method: 'DELETE',
        body: {
            memberIds: memberIds,
        }
    }).then(() => {
        toast.add({
            color: 'success',
            title: t('organisations.teams.members.deleteSuccess'),
        })
        members.refresh();
    }).catch((error) => {
        console.error(error)
        toast.add({
            color: 'error',
            title: t('organisations.teams.members.deleteError'),
        })
    })
}
</script>

<template>
    <div class="my-4">
        <div v-if="editing">
            <UForm :schema="schema" :state="state" @submit="updateTeamDetails">
                <div class="flex items-center justify-between mb-4 gap-2 h-[44px]">
                    <UInput v-model="state.name" name="name" size="lg" class="w-full" />
                    <UButton :loading="saving" type="submit" size="lg" icon="i-lucide-check">
                        {{ $t('common.save') }}
                    </UButton>
                </div>

                <UTextarea v-model="state.description" name="description" size="lg" class="w-full"
                    placeholder="Description (optional)" />
            </UForm>
        </div>
        <div v-else>
            <div class="flex items-center justify-between mb-4">
                <h2
                    class="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight dark:text-neutral-200 mb-2">
                    {{ team?.data?.value?.name }}
                </h2>
                <UButton size="lg" icon="i-lucide-pencil" @click="switchEditing">
                    {{ $t('common.edit') }}
                </UButton>
            </div>

            <p class="mb-4">{{ team?.data?.value?.description }}</p>
        </div>

        <USeparator />

        <UTable :data="members?.data?.value || []" :columns="membersColumns">
            <template #action-header>
                <div class="text-right">
                    <UModal v-model:open="addMemberModalOpen" :title="$t('organisations.teams.members.add')"
                        @update:open="cleanupAddMemberModal()">
                        <UButton icon="i-lucide-plus" color="primary" variant="solid">
                            {{ $t('organisations.teams.members.add') }}
                        </UButton>

                        <template #body>
                            <UForm :schema="addMemberSchema" :state="addMemberState" @submit="createTeamMembers">
                                <UFormField :label="$t('organisations.teams.members.title')" name="memberIds" size="xl">
                                    <OrganisationMemberSelectField v-model="addMemberState.memberIds"
                                        :organisation-id="organisationId" :exclude-team="teamId" class="w-full" />
                                </UFormField>

                                <USeparator class="my-3" />

                                <div class="flex items-center justify-end gap-2">
                                    <UButton color="neutral" @click="toggleAddMemberModal()">
                                        {{ $t('common.cancel') }}
                                    </UButton>
                                    <UButton type="submit">
                                        {{ $t('common.save') }}
                                    </UButton>
                                </div>
                            </UForm>
                        </template>
                    </UModal>
                </div>
            </template>
            <template #action-cell="{ row }">
                <div class="text-right">
                    <UButton color="error" class="ml-auto" icon="i-lucide-trash"
                        :label="$t('organisations.teams.members.delete')"
                        @click="deleteMembers([row.original.memberId])" />
                </div>
            </template>

            <template #name-cell="{ row }">
                <div class="flex items-center gap-3">
                    <UAvatar :src="getUserImagePath(row.original.user)" :alt="`${row.original.user?.name}`" />
                    <p class="font-medium text-highlighted">
                        {{ row.original.user?.name }}
                    </p>
                </div>
            </template>
        </UTable>
    </div>
</template>
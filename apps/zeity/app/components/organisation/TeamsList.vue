<script setup lang="ts">

const { t } = useI18n()
const toast = useToast()

const { organisationId } = defineProps({
    organisationId: {
        type: String,
        required: true
    },
})

const { pending, data, refresh } = await useFetch(() => `/api/organisation/${organisationId}/team`);

function deleteTeam(teamId: string) {
    return $fetch(`/api/organisation/${organisationId}/team/${teamId}`, {
        method: 'DELETE'
    }).then(() => {
        toast.add({
            color: 'success',
            title: t('organisations.members.deleteSuccess'),
        })
        refresh()
    }).catch((error) => {
        console.error(error)
        toast.add({
            color: 'error',
            title: t('organisations.members.deleteError'),
        })
    })
}
</script>

<template>
    <div>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold leading-6">
                {{ $t('organisations.teams.title') }}
            </h3>

            <UButton :to="`/organisations/${organisationId}/team/create`" icon="i-lucide-plus" color="primary"
                variant="solid">
                {{ $t('organisations.teams.create') }}
            </UButton>
        </div>

        <div class="flex flex-col gap-4 mb-4">
            <USkeleton v-if="pending" class="h-35" />

            <UCard v-for="team in data" :key="team.id">
                <div class="flex justify-between items-center mb-2">
                    <div class="flex flex-col gap-2">
                        <nuxt-link :to="`/organisations/${organisationId}/team/${team.id}`"
                            class="text-lg font-semibold text-primary">
                            {{ team.name }}
                        </nuxt-link>
                        <p class="text-sm text-muted-foreground line-clamp-2">
                            {{ team.description }}
                        </p>
                        <p class="text-sm text-muted-foreground ">
                            {{ $t('organisations.members.count', team?.memberCount ?? 0) }}
                        </p>
                    </div>

                    <UFieldGroup orientation="vertical">
                        <UButton :to="`/organisations/${organisationId}/team/${team.id}`" icon="i-lucide-eye"
                            color="neutral" variant="subtle">
                            {{ $t('common.view') }}
                        </UButton>
                        <UButton icon="i-lucide-trash" color="error" variant="subtle" @click="deleteTeam(team.id)">
                            {{ $t('common.delete') }}
                        </UButton>
                    </UFieldGroup>
                </div>
            </UCard>
        </div>
    </div>
</template>
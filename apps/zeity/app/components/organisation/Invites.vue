<script setup lang="ts">
import { z } from 'zod'
import type { Row } from '@tanstack/vue-table'
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { OrganisationInvite } from '@zeity/types/organisation'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const NuxtTime = resolveComponent('NuxtTime')

const { t, locale } = useI18n()
const toast = useToast()

const params = defineProps({
    organisationId: {
        type: String,
        required: true
    },
    invites: {
        type: Array as PropType<OrganisationInvite[]>,
        default: () => [],
    }
})
const emit = defineEmits(['refresh'])

const invitesColumns: TableColumn<OrganisationInvite>[] = [
    {
        accessorKey: 'email',
        header: t('user.email'),
    },
    {
        accessorKey: 'createdAt',
        header: t('organisations.invitationDate'),
        cell: ({ row }) => {
            const createdAt = row.getValue('createdAt');
            return h(NuxtTime, {
                datetime: createdAt,
                relative: true,
                locale: locale.value
            })
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            return h(
                'div',
                { class: 'text-right' },
                h(
                    UDropdownMenu,
                    {
                        content: {
                            align: 'end'
                        },
                        items: getInviteActionItems(row)
                    },
                    () =>
                        h(UButton, {
                            icon: 'i-lucide-ellipsis-vertical',
                            color: 'neutral',
                            variant: 'ghost',
                            class: 'ml-auto',
                        })
                )
            )
        }
    }
];

const createModalOpen = ref(false)

const inviteSchema = z.object({
    email: z.string().email()
})
type InviteSchema = z.output<typeof inviteSchema>
const inviteState = ref<InviteSchema>({
    email: ''
})

function getInviteActionItems(row: Row<OrganisationInvite>) {
    return [
        {
            type: 'label',
            icon: 'i-lucide-sliders-vertical',
            label: t('common.actions')
        },
        {
            type: 'separator'
        },
        {
            label: t('organisations.invites.resend'),
            icon: 'i-lucide-send',
            onSelect() {
                resendInvite(row.original.id)
            }
        },
        {
            label: t('common.delete'),
            icon: 'i-lucide-trash',
            onSelect() {
                deleteInvite(row.original.id)
            }
        }
    ]
}

function createInvite(event: FormSubmitEvent<InviteSchema>) {
    $fetch(`/api/organisation/${params.organisationId}/invite`, {
        method: 'POST',
        body: {
            email: event.data.email
        }
    }).then(() => {
        toast.add({
            color: 'success',
            title: t('organisations.invites.createSuccess'),
        })
        emit('refresh')
        toggleCreateModal()
    }).catch((error) => {
        console.error(error)
        toast.add({
            color: 'error',
            title: t('organisations.invites.createError'),
        })
    })
}

function resendInvite(id: string) {
    $fetch(`/api/organisation/${params.organisationId}/invite/${id}/resend`, {
        method: 'POST'
    }).then(() => {
        toast.add({
            color: 'success',
            title: t('organisations.invites.resendSuccess'),
        })
    }).catch((error) => {
        console.error(error)
        toast.add({
            color: 'error',
            title: t('organisations.invites.resendError'),
        })
    })
}

function deleteInvite(id: string) {
    return $fetch(`/api/organisation/${params.organisationId}/invite/${id}`, {
        method: 'DELETE'
    }).then(() => {
        toast.add({
            color: 'success',
            title: t('organisations.invites.deleteSuccess'),
        })
        emit('refresh')
    }).catch((error) => {
        console.error(error)
        toast.add({
            color: 'error',
            title: t('organisations.invites.deleteError'),
        })
    })
}

function toggleCreateModal() {
    createModalOpen.value = !createModalOpen.value
}
</script>

<template>
    <div>
        <UModal v-model:open="createModalOpen" :title="$t('organisations.invites.create')">
            <template #body>
                <UForm :schema="inviteSchema" :state="inviteState" @submit="createInvite">
                    <UFormField :label="$t('user.email')" name="email" size="xl">
                        <UInput v-model="inviteState.email" class="w-full" />
                    </UFormField>

                    <USeparator class="my-3" />

                    <div class="flex items-center justify-end gap-2">
                        <UButton color="neutral" @click="toggleCreateModal()">
                            {{ $t('common.cancel') }}
                        </UButton>
                        <UButton type="submit">
                            {{ $t('common.send') }}
                        </UButton>
                    </div>
                </UForm>
            </template>
        </UModal>

        <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold leading-6">
                {{ $t('organisations.invites.title') }}
            </h3>
            <UButton color="primary" variant="ghost" icon="i-lucide-plus" @click="toggleCreateModal">
                {{ $t('organisations.invites.create') }}
            </UButton>
        </div>
        <UTable :data="invites" :columns="invitesColumns" :empty="$t('organisations.invites.empty')" />
    </div>
</template>
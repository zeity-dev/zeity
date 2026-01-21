<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
})

const { t } = useI18n()
const token = useRoute().query.token as string

const { status, data } = await useLazyFetch('/api/organisation/join', {
    query: {
        token
    },
    server: false,
});
const isLoading = computed(() => ['pending', 'idle'].includes(status.value))

async function acceptInvite() {
    await $fetch(`/api/organisation/join/accept`, {
        method: 'POST',
        query: {
            token
        }
    })
        .then(() => {
            return useToast().add({
                title: t('common.success'),
                description: t('organisations.join.acceptSuccess'),
                color: 'success'
            })
        })
        .then(async () => await navigateTo('/user'))
        .catch((error) => {
            console.error(error)
            useToast().add({
                title: t('common.error'),
                description: t('organisations.join.acceptError'),
                color: 'error'
            })
        })
}
</script>

<template>

    <div class="my-4">
        <h2 class="text-2xl font-bold mb-4">{{ $t('organisations.join.title') }}</h2>

        <div v-if="isLoading" class="space-y-4">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-8 w-32" />
        </div>
        <div v-else-if="status === 'success'" class="space-y-4">
            <i18n-t keypath="organisations.join.description" tag="p">
                <template #organisation>
                    <b>{{ data?.organisation?.name }}</b>
                </template>
            </i18n-t>
            <div>
                <UButton @click="acceptInvite">
                    {{ $t('organisations.join.accept') }}
                </UButton>
            </div>
        </div>
        <div v-else>
            <UAlert color="error" :title="$t('common.error')" :description="$t('organisations.join.error')" :actions="[{
                label: $t('navigation.user'),
                to: '/user',
                color: 'neutral'
            }]" />
        </div>
    </div>

</template>
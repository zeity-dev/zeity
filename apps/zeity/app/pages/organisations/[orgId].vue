<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import type { Organisation } from '@zeity/database/organisation';
import { ORGANISATION_MEMBER_ROLE_ADMIN, ORGANISATION_MEMBER_ROLE_OWNER } from '@zeity/types';

definePageMeta({
    validate: async (route) => {
        // Check if the id is made up of digits
        return typeof route.params.orgId === 'string'
    }
})

const organisationId = useRoute().params.orgId as string;
const isOrgAdmin = useOrganisation().userHasOrganisationRole(organisationId, [ORGANISATION_MEMBER_ROLE_ADMIN, ORGANISATION_MEMBER_ROLE_OWNER]);

const { t } = useI18n()

const links = computed(() => {
    const links: NavigationMenuItem[] = [
        { label: t('common.general'), to: `/organisations/${organisationId}`, exact: true },
    ];

    if (isOrgAdmin.value) {
        links.push(
            { label: t('organisations.invites.title'), to: `/organisations/${organisationId}/invite` },
            { label: t('organisations.members.title'), to: `/organisations/${organisationId}/member` },
            { label: t('organisations.teams.title'), to: `/organisations/${organisationId}/team` },
        );
    }

    return links;
})

const { data, refresh, error } = await useFetch<Organisation>(() => `/api/organisation/${organisationId}`);

switch (error.value?.statusCode) {
    case 401:
        await navigateTo('/auth/login');
        break;
    case 400:
    case 403:
    case 404:
        await navigateTo('/organisations');
        break;
}

async function refreshOrganisation() {
    await useUser().reloadUser();
    return refresh();
}
</script>

<template>
    <UDashboardPanel :id="`organisation-${organisationId}`">
        <template #header>
            <UBreadcrumb :items="[{ label: $t('organisations.title'), to: '/organisations' }]" class="mt-4" />
            <UDashboardNavbar :title="data?.name" :toggle="false" />

            <UDashboardToolbar>
                <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
            </UDashboardToolbar>
        </template>

        <template #body>
            <NuxtPage v-if="data" :org="data" @refresh="refreshOrganisation" />
        </template>
    </UDashboardPanel>
</template>
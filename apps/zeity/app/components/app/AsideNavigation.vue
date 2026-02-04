<script setup lang="ts">
const { loggedIn } = useUserSession();
const { verticalMenu } = useNavigation();
</script>

<template>
    <div class="flex flex-col gap-3 h-full">
        <OrganisationMenu v-if="loggedIn" />

        <UNavigationMenu :items="verticalMenu[0]" orientation="vertical" class="flex justify-between w-full" />

        <UNavigationMenu :items="verticalMenu[1]" orientation="vertical" class="flex justify-between w-full mt-auto" />

        <USeparator />

        <UserMenu />
    </div>
</template>

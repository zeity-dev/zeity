<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import type { User } from '@zeity/database/user';

const props = defineProps({
    loading: {
        type: Boolean,
        default: false,
    },
});
const user = defineModel<User | null>()

const { t } = useI18n()
const toast = useToast()
const { updateUser, uploadImage, fetchUser } = useUser()

const saveLoading = ref(false);
const isLoading = computed(() => props.loading || saveLoading.value);

const userSchema = z.object({
    name: z.string().min(1).trim(),
});
type UserSchema = z.output<typeof userSchema>
const userState = ref<Partial<UserSchema>>({
    name: user.value?.name ?? '',
});

watch(user, (value) => {
    userState.value = {
        name: value?.name ?? '',
    }
});

function handleUpdateUser(event: FormSubmitEvent<UserSchema>) {
    return updateUser(event.data)
        .then((data) => {
            user.value = data.user as User;
            toast.add({
                color: 'success',
                title: t('user.saveSuccess'),
            });
        })
        .catch((error) => {
            console.error(error)
            toast.add({
                color: 'error',
                title: t('user.saveError'),
            })
        });

}

function handleUserImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        saveLoading.value = true;
        await uploadImage(file)
            .then(fetchUser)
            .then(() => {
                toast.add({
                    color: 'success',
                    title: t('user.saveSuccess'),
                });
                // TODO: find a better way to update the user image
                reloadNuxtApp();
            })
            .catch((error) => {
                console.error(error)
                toast.add({
                    color: 'error',
                    title: t('user.saveError'),
                })
            })
            .finally(() => {
                saveLoading.value = false;
            });
    };
}
</script>

<template>
    <div>
        <div v-if="loading" class="flex flex-col gap-2">
            <USkeleton class="h-14 w-14 rounded-full" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-8 w-full" />
            <USkeleton class="h-8 w-full" />
        </div>
        <UForm v-else class="flex flex-col gap-2" :schema="userSchema" :state="userState"
            @submit.prevent="handleUpdateUser">

            <div v-if="user" class="flex flex-col items-center gap-2">
                <UserImage :user="user" size="144" />

                <UButton :disabled="isLoading" :label="$t('common.upload')" icon="i-lucide-camera" variant="subtle"
                    @click="handleUserImageUpload" />
            </div>

            <UFormField :label="$t('user.email')" loading>
                <UInput :value="user?.email" disabled readonly class="w-full" />
            </UFormField>
            <UFormField name="name" :label="$t('user.name')">
                <UInput v-model="userState.name"  class="w-full" />
            </UFormField>

            <UButton :disabled="isLoading" :label="$t('common.save')" block type="submit" icon="i-lucide-save" />
        </UForm>
    </div>
</template>
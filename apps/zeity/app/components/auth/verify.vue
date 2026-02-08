<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { z } from 'zod';

const emits = defineEmits(['submit']);

const { t } = useI18n();
const toast = useToast();

const schema = z.object({
    code: z.array(z.string().length(1)).length(6),
});
type Schema = z.output<typeof schema>
const state = ref<Partial<Schema>>({
    code: [],
});

function verify(event: FormSubmitEvent<Schema>) {
    return $fetch('/api/user/verify', {
        method: 'POST',
        body: { code: event.data.code.join('') },
    })
        .then(() => {
            toast.add({
                color: 'success',
                title: t('user.verificationSuccess'),
            })
            emits('submit')
        })
        .catch((error) => {
            console.error(error);
            toast.add({
                color: 'error',
                title: t('user.verificationError'),
            })
        });
}

function resend() {
    return $fetch('/api/user/resend-verification', {
        method: 'POST',
    })
        .then(() => {
            toast.add({
                color: 'success',
                title: t('user.resendVerificationSuccess'),
            })
        })
        .catch((error) => {
            console.error(error)
            toast.add({
                color: 'error',
                title: t('user.resendVerificationError'),
            })
        })
}
</script>

<template>
    <UForm :schema="schema" :state="state" @submit="verify">
        <UFormField name="code" class="text-center">
            <UPinInput v-model="state.code" size="xl" length="6" otp />
        </UFormField>

        <div class="text-right">
            <UButton variant="link" size="sm" @click="resend">
                {{ t('user.resendVerification') }}
            </UButton>
        </div>

        <UButton block type="submit" :label="t('user.verify')" />
    </UForm>
</template>
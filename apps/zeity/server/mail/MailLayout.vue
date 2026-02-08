<script setup lang="ts">
import {
  Tailwind,
  Html,
  Head,
  Body,
  Preview,
  Container,
  Section,
  Img,
  Text,
} from '@vue-email/components';
import colors from 'tailwindcss/colors';

const config = {
  theme: {
    extend: {
      colors: {
        primary: colors.sky[500],
        'primary-50': colors.sky[50],
        'primary-100': colors.sky[100],
        'primary-200': colors.sky[200],
        'primary-300': colors.sky[300],
        'primary-400': colors.sky[400],
        'primary-500': colors.sky[500],
        'primary-600': colors.sky[600],
        'primary-700': colors.sky[700],
        'primary-800': colors.sky[800],
        'primary-900': colors.sky[900],

        neutral: colors.stone[500],
        'neutral-50': colors.stone[50],
        'neutral-100': colors.stone[100],
        'neutral-200': colors.stone[200],
        'neutral-300': colors.stone[300],
        'neutral-400': colors.stone[400],
        'neutral-500': colors.stone[500],
        'neutral-600': colors.stone[600],
        'neutral-700': colors.stone[700],
        'neutral-800': colors.stone[800],
        'neutral-900': colors.stone[900],

        bg: colors.white,
        text: colors.stone[700],
      },
    },
  },
} as never; // tailwind v3 & v4 mismatch
defineProps({
  preview: {
    type: String,
    default: 'zeity - time tracking',
  },
});

const appName = useRuntimeConfig().public.appName;
</script>

<template>
  <Tailwind :config="config">
    <Html lang="en">
      <Head>
        <title>{{ preview }}</title>
      </Head>
      <Preview>{{ preview }}</Preview>

      <Body class="font-sans">
        <Container class="bg-bg text-text p-4 my-auto rounded-lg shadow-lg">
          <Section>
            <slot />
          </Section>

          <Text
            class="text-center font-bold text-xl text-neutral-900 dark:text-white min-w-0"
          >
            <Img
              src="https://www.zeity.dev/favicon.svg"
              width="40"
              height="40"
              alt="zeity"
              class="m-auto"
            />
            {{ appName }}
          </Text>
        </Container>
      </Body>
    </Html>
  </Tailwind>
</template>

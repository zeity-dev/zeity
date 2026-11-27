<script setup lang="ts">
import type { PropType } from 'vue';
import { Button, Heading, Section, Text } from '@vue-email/components';
import type { MailSection } from '~~/shared/types/mail';
import MailLayout from './MailLayout.vue';

defineProps({
  subject: {
    type: String,
    required: true,
  },
  sections: {
    type: Array as PropType<MailSection[]>,
    required: false,
    default: null,
  },
  messages: {
    type: Array as PropType<string[]>,
    required: true,
  },
  link: {
    type: Object as PropType<{ url: string; text: string }>,
    required: false,
    default: null,
  },
});
</script>

<template>
  <MailLayout :preview="subject">
    <Heading as="h1" class="text-xl">{{ subject }}</Heading>

    <Text v-for="message in messages" :key="message">
      {{ message }}
    </Text>

    <Section v-for="(section, sectionIndex) in sections" :key="sectionIndex" :class="section.class">
      <Text v-for="(child, childIndex) in section.children" :key="childIndex" :class="child.class">
        <template v-if="'url' in child">
          <Button
            :href="child.url"
            referrerpolicy="strict-origin"
            class="rounded-md font-medium inline-flex items-center focus:outline-hidden transition-colors px-2.5 py-1.5 m-auto text-sm gap-1.5 justify-center text-text bg-primary-400 hover:bg-primary/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :class="child.class"
          >
            {{ child.text }}
          </Button>
        </template>
        <template v-else>
          <Text :class="child.class">
            {{ child.text }}
          </Text>
        </template>
      </Text>
    </Section>

    <Section v-if="link" class="text-center">
      <Button
        v-if="link"
        :href="link.url"
        referrerpolicy="strict-origin"
        class="rounded-md font-medium inline-flex items-center focus:outline-hidden transition-colors px-2.5 py-1.5 m-auto text-sm gap-1.5 justify-center text-text bg-primary-400 hover:bg-primary/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {{ link.text }}
      </Button>
    </Section>
  </MailLayout>
</template>

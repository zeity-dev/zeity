import type { Component } from 'vue';
import { render, type ExtractComponentProps } from '@vue-email/render';
import MailMessage from '../mail/MailMessage.vue';
import MailWelcome from '../mail/MailWelcome.vue';

async function renderVueMail<T extends Component>(component: T, props?: ExtractComponentProps<T>) {
  const [html, text] = await Promise.all([
    render(component, props, { pretty: import.meta.dev ?? false }),
    render(component, props, { plainText: true }),
  ]);

  return {
    html,
    text,
  };
}

function renderWelcomeMail(props: ExtractComponentProps<typeof MailWelcome>) {
  return renderVueMail(MailWelcome, props);
}

function renderMessageMail(props: ExtractComponentProps<typeof MailMessage>) {
  return renderVueMail(MailMessage, props);
}

export function useMailTemplate() {
  return {
    renderVueMail,
    renderMessageMail,
    renderWelcomeMail,
  };
}

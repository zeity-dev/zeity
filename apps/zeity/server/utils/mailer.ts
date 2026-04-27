import type { H3Event } from 'h3';
import { createConsola } from 'consola';
import type { EmailAddress } from 'unemail';
import { createEmail } from 'unemail';
import smtpDriver from 'unemail/driver/smtp';

import type { MailSection } from '~~/shared/types/mail';
import { useMailTemplate } from './mail-template';

type MailTo = EmailAddress | EmailAddress[];
type MailContent = { html?: string; text: string } | { html: string; text?: string };

type SendMailOptions = {
  to: MailTo;
  cc?: MailTo;
  bcc?: MailTo;
  subject: string;
} & MailContent;

const logger = createConsola({}).withTag('mailer');
let driver: ReturnType<typeof smtpDriver> | undefined;

async function sendMail(options: SendMailOptions) {
  if (!driver) {
    throw new Error('No mailer driver available, cannot send mail');
  }

  if (!options.to) {
    logger.warn('Could not send mail: No recipient specified', options.subject);
    throw new Error('No recipient specified');
  }

  const from = useRuntimeConfig().mailer.from;

  const email = createEmail({ driver });
  const info = await email
    .send({
      from,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text || '',
      html: options.html,
    })
    .catch(e => {
      logger.error('Sending mail failed', e);
    });

  if (info?.error) {
    logger.error('Sending mail failed', info.error);
  }

  logger.debug('Message sent: %s', info);
}

async function sendWelcomeMail(to: EmailAddress, otp?: string) {
  const { html, text } = await useMailTemplate().renderWelcomeMail({
    name: to.name ?? to.email,
    otp,
  });

  return sendMail({
    to,
    subject: 'Welcome to zeity',
    html,
    text,
  });
}

async function sendMessageMail(
  to: MailTo,
  subject: string,
  messages: string[],
  sections: MailSection[] = [],
) {
  const { html, text } = await useMailTemplate().renderMessageMail({
    subject,
    messages,
    sections,
  });

  return sendMail({
    to,
    subject,
    html,
    text,
  });
}

export function useMailer(event: H3Event) {
  try {
    const smtp = useRuntimeConfig(event).mailer.smtp;
    driver ??= smtpDriver(smtp);
  } catch (e) {
    logger.error('Failed to create mailer driver', e);
  }

  return {
    sendMail,
    sendMessageMail,
    sendWelcomeMail,
  };
}

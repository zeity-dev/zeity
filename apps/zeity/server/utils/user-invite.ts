import { type RequestEvent, getRequestURL } from 'nuxt/server';
import { SignJWT, jwtVerify } from 'jose';

import type { Organisation } from '@zeity/database/organisation';
import type { OrganisationInvite } from '@zeity/database/organisation-invite';
import { JWT_ALGORITHM, useJwtSecret } from './jwt-secret';
import { useMailer } from './mailer';

const JWT_ISSUER = 'zeity';

export function generateInviteToken(secret: Uint8Array, inviteId: string) {
  return new SignJWT({ inviteId })
    .setProtectedHeader({
      alg: JWT_ALGORITHM,
    })
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyInviteToken(secret: Uint8Array, token: string) {
  const { payload } = await jwtVerify<{ inviteId: string }>(token, secret, {
    issuer: JWT_ISSUER,
    algorithms: [JWT_ALGORITHM],
  });

  return payload;
}

export function useUserInvite(event: RequestEvent) {
  return {
    generateLink: async (userId: string) => {
      const jwtSecret = await useJwtSecret();
      const token = await generateInviteToken(jwtSecret, userId);

      const baseUrl = getRequestURL(event).origin;
      return `${baseUrl}/user/join?token=${token}`;
    },
    generateToken: async (userId: string) => {
      const jwtSecret = await useJwtSecret();
      return generateInviteToken(jwtSecret, userId);
    },
    verifyToken: async (token: string) => {
      const jwtSecret = await useJwtSecret();
      return verifyInviteToken(jwtSecret, token);
    },
  };
}

export async function sendInviteMail(
  event: RequestEvent,
  organisation: Organisation,
  invite: OrganisationInvite,
) {
  const link = await useUserInvite(event).generateLink(invite.id);

  await useMailer().sendMessageMail(
    { email: invite.email },
    `Invitation to join ${organisation.name}`,
    [`You have been invited to join ${organisation.name}.`],
    [
      {
        class: 'text-center',
        children: [
          {
            url: link,
            text: 'Accept Invitation',
          },
        ],
      },
    ],
  );
}

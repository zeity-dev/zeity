import type { Organisation } from '@zeity/database/organisation';
import type { OrganisationMember } from '@zeity/database/organisation-member';
import type { OrganisationInvite } from '@zeity/database/organisation-invite';

export type OrganisationMemberWithUser = Pick<
  OrganisationMember,
  'id' | 'userId' | 'organisationId' | 'role'
> & {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean | null | undefined;
    image?: string | null | undefined;
  };
};

export type OrganisationWithMembersAndInvites = Organisation & {
  members: OrganisationMember[];
  invites: OrganisationInvite[];
};

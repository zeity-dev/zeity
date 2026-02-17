import type { User } from '@zeity/database/user';
import type { Organisation } from '@zeity/database/organisation';
import type { OrganisationMemberRole } from '@zeity/types';

export type LocalUser = Pick<User, 'id' | 'name' | 'email' | 'image'> & {
  emailVerified: boolean;
};

export type LocalOrganisation = Pick<Organisation, 'id' | 'name' | 'image'> & {
  member: {
    id: string;
    role: OrganisationMemberRole;
  };
};

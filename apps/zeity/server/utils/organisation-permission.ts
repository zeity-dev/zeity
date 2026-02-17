import type { User } from '@zeity/database/user';
import type { Organisation } from '@zeity/database/organisation';
import type { OrganisationMember } from '@zeity/database/organisation-member';
import {
  ORGANISATION_MEMBER_ROLE_ADMIN,
  ORGANISATION_MEMBER_ROLE_MEMBER,
  ORGANISATION_MEMBER_ROLE_OWNER,
} from '@zeity/types';
import {
  getOrganisationMembersByUserIds,
  getOrganisationMemberByUserId,
} from './organisation';

const privilegedRoles = [
  ORGANISATION_MEMBER_ROLE_OWNER,
  ORGANISATION_MEMBER_ROLE_ADMIN,
];

export function isUserOrganisationMember(
  user: Pick<User, 'id'>,
  organisationMembers: OrganisationMember[],
) {
  return organisationMembers.some(
    (member) => member.userId === user.id && member.role,
  );
}

export function userIdBelongsToOrganisation(
  userId: string,
  org: Pick<Organisation, 'id'>,
) {
  return getOrganisationMemberByUserId(org.id, userId).then((res) =>
    Boolean(res),
  );
}

export function userIdsBelongsToOrganisation(
  org: Pick<Organisation, 'id'>,
  userIds: string[],
) {
  return getOrganisationMembersByUserIds(org.id, userIds).then((res) => {
    return res.length === userIds.length;
  });
}

export function canUserReadOrganisation(
  user: Pick<User, 'id'>,
  organisationMembers: OrganisationMember[],
) {
  return isUserOrganisationMember(user, organisationMembers);
}

export function canUserUpdateOrganisation(
  user: Pick<User, 'id'>,
  organisationMembers: OrganisationMember[],
) {
  return organisationMembers.some(
    (member) =>
      member.userId === user.id && privilegedRoles.includes(member.role),
  );
}

export function canUserReadOrganisationByOrgId(
  user: Pick<User, 'id'>,
  orgId: string,
) {
  return hasUserOrganisationMemberRole(
    { organisationId: orgId, userId: user.id },
    [
      ORGANISATION_MEMBER_ROLE_OWNER,
      ORGANISATION_MEMBER_ROLE_ADMIN,
      ORGANISATION_MEMBER_ROLE_MEMBER,
    ],
  );
}

export function canUserUpdateOrganisationByOrgId(
  user: Pick<User, 'id'>,
  orgId: string,
) {
  return hasUserOrganisationMemberRole(
    { organisationId: orgId, userId: user.id },
    [ORGANISATION_MEMBER_ROLE_OWNER, ORGANISATION_MEMBER_ROLE_ADMIN],
  );
}

export function canUserDeleteOrganisationByOrgId(
  user: Pick<User, 'id'>,
  orgId: string,
) {
  return hasUserOrganisationMemberRole(
    { organisationId: orgId, userId: user.id },
    [ORGANISATION_MEMBER_ROLE_OWNER],
  );
}

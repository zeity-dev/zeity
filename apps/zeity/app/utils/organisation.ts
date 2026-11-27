import {
  ORGANISATION_MEMBER_ROLE_ADMIN,
  ORGANISATION_MEMBER_ROLE_MEMBER,
  ORGANISATION_MEMBER_ROLE_OWNER,
  type OrganisationMemberRole,
} from '@zeity/types/organisation';

export function findRoleLabel(role: OrganisationMemberRole) {
  return {
    [ORGANISATION_MEMBER_ROLE_OWNER]: 'organisations.members.role.owner',
    [ORGANISATION_MEMBER_ROLE_ADMIN]: 'organisations.members.role.admin',
    [ORGANISATION_MEMBER_ROLE_MEMBER]: 'organisations.members.role.member',
  }[role];
}

export function findRoleIcon(role: OrganisationMemberRole) {
  return {
    [ORGANISATION_MEMBER_ROLE_OWNER]: 'i-lucide-crown',
    [ORGANISATION_MEMBER_ROLE_ADMIN]: 'i-lucide-trophy',
    [ORGANISATION_MEMBER_ROLE_MEMBER]: 'i-lucide-award',
  }[role];
}

export function findRoleColor(role: OrganisationMemberRole) {
  return {
    [ORGANISATION_MEMBER_ROLE_OWNER]: 'success' as const,
    [ORGANISATION_MEMBER_ROLE_ADMIN]: 'success' as const,
    [ORGANISATION_MEMBER_ROLE_MEMBER]: 'primary' as const,
  }[role];
}

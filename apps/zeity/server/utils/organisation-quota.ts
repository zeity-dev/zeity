import { count } from '@zeity/database';
import { organisations } from '@zeity/database/organisation';
import { organisationMembers } from '@zeity/database/organisation-member';

import { organisationInvites } from '@zeity/database/organisation-invite';

export async function getOrganisationQuota(organisationId: string) {
  const quota = await useDrizzle()
    .select({
      quota: organisations.quota,
    })
    .from(organisations)
    .where(eq(organisations.id, organisationId))
    .limit(1)
    .then((res) => res[0]?.quota);

  return quota;
}

export async function checkOrganisationMembersQuota(
  organisationId: string,
): Promise<boolean> {
  const quota = await getOrganisationQuota(organisationId);

  const membersQuota = quota?.members;
  // If no quota is set, allow unlimited users
  if (membersQuota === undefined) {
    return true;
  }

  const db = useDrizzle();
  const [memberCount, invitesCount] = await Promise.all([
    db
      .select({ count: count() })
      .from(organisationMembers)
      .where(and(eq(organisationMembers.organisationId, organisationId)))
      .then((res) => res[0]?.count ?? 0),
    db
      .select({ count: count() })
      .from(organisationInvites)
      .where(and(eq(organisationInvites.organisationId, organisationId)))
      .then((res) => res[0]?.count ?? 0),
  ]);

  if (memberCount + invitesCount < membersQuota) {
    return true;
  }

  return false;
}

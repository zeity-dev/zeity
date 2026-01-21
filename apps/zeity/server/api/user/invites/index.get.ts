import { eq } from '@zeity/database';
import { organisations } from '@zeity/database/organisation';
import { organisationInvites } from '@zeity/database/organisation-invite';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const db = useDrizzle();
  const invites = await db
    .select({
      id: organisationInvites.id,
      organisation: {
        id: organisations.id,
        name: organisations.name,
        image: organisations.image,
      },
    })
    .from(organisationInvites)
    .leftJoin(
      organisations,
      eq(organisationInvites.organisationId, organisations.id),
    )
    .where(eq(organisationInvites.email, session.user.email))
    .orderBy(asc(organisationInvites.createdAt));

  return invites;
});

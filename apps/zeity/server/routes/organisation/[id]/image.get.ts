import getEtag from 'etag';
import { createError, defineHandler, getRequestHeader } from 'nuxt/server';
import { z } from 'zod';
import { useDrizzle } from '#server/utils/drizzle';
import { readStorageFile } from '#server/utils/storage';
import { getSafeRouterParams } from '#server/utils/zod';
import { eq } from '@zeity/database';
import { organisations } from '@zeity/database/organisation';

export default defineHandler(async event => {
  const params = await getSafeRouterParams(
    event,
    z.object({
      id: z.uuid(),
    }).safeParse,
  );

  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  const organisation = await useDrizzle()
    .select({
      image: organisations.image,
    })
    .from(organisations)
    .where(eq(organisations.id, params.data.id))
    .limit(1)
    .then(rows => rows[0]);

  if (!organisation) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  if (!organisation.image) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  const file = await readStorageFile(organisation.image);
  if (!file || !file.ok) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  // file data should only be read once
  const blob = await file.blob();

  const buffer = Buffer.from(await blob.arrayBuffer());
  const etag = getEtag(buffer);
  event.res.headers.set('etag', etag);

  // // Check for if-none-match request header
  if (etag && getRequestHeader(event, 'if-none-match') === etag) {
    return new Response(null, { status: 304 });
  }

  event.res.headers.set('content-type', file.type);

  return new Response(blob);
});

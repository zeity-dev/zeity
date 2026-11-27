import { createError, defineHandler } from 'nuxt/server';
import sharp from 'sharp';
import { z } from 'zod';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { getSafeRouterParams } from '#server/utils/zod';
import { eq } from '@zeity/database';
import { organisations } from '@zeity/database/organisation';
import { checkFileSize, checkMimeType } from '~~/server/utils/image';
import { doesOrganisationExist } from '~~/server/utils/organisation';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';
import { saveStorageFile } from '~~/server/utils/storage';

export default defineHandler(async event => {
  const session = await requireUserSession(event);

  const params = await getSafeRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
    }).safeParse,
  );
  if (!params.success) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  const existing = await doesOrganisationExist(params.data.orgId);
  if (!existing) {
    throw createError({
      status: 404,
      message: 'Not Found',
    });
  }

  if (!(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))) {
    throw createError({
      status: 403,
      message: 'Forbidden',
    });
  }

  const formData = await event.req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    throw createError({
      status: 400,
      message: 'No files found',
    });
  }

  if (!checkFileSize(file.size)) {
    throw createError({
      status: 400,
      message: 'File size exceeds limit',
    });
  }
  if (!checkMimeType(file.type)) {
    throw createError({
      status: 400,
      message: 'Invalid file type',
    });
  }

  try {
    const fileName = 'profile.png';
    const key = `org/${params.data.orgId}/${fileName}`;

    const optimized = await sharp(Buffer.from(await file.arrayBuffer()))
      .png({ quality: 80 })
      .resize(144, 144, {
        fit: 'contain',
        position: 'center',
      })
      .toBuffer();

    await saveStorageFile(key, {
      data: optimized,
      type: 'image/png',
      name: fileName,
    });

    await useDrizzle()
      .update(organisations)
      .set({ image: key })
      .where(eq(organisations.id, params.data.orgId));
  } catch (error) {
    console.error('Error saving file:', error);
    throw createError({
      status: 500,
      message: 'Failed to save file',
    });
  }

  return new Response(null, { status: 204 });
});

import { z } from 'zod';
import sharp from 'sharp';
import { eq } from '@zeity/database';
import { organisations } from '@zeity/database/organisation';

import { saveStorageFile } from '~~/server/utils/storage';
import { checkFileSize, checkMimeType } from '~~/server/utils/image';
import { doesOrganisationExist } from '~~/server/utils/organisation';
import { canUserUpdateOrganisationByOrgId } from '~~/server/utils/organisation-permission';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      orgId: z.uuid(),
    }).safeParse
  );
  if (!params.success) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  const existing = await doesOrganisationExist(params.data.orgId);
  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    });
  }

  if (
    !(await canUserUpdateOrganisationByOrgId(session.user, params.data.orgId))
  ) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  const files = await readMultipartFormData(event);
  if (!files?.length) {
    throw createError({
      statusCode: 400,
      message: 'No files found',
    });
  }

  const file = files[0];
  if (!file) {
    throw createError({
      statusCode: 400,
      message: 'Invalid file',
    });
  }

  if (!checkFileSize(file.data.byteLength)) {
    throw createError({
      statusCode: 400,
      message: 'File size exceeds limit',
    });
  }
  if (!checkMimeType(file.type)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid file type',
    });
  }

  try {
    const fileName = 'profile.png';
    const key = `org/${params.data.orgId}/${fileName}`;

    const optimized = await sharp(file.data)
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
      statusCode: 500,
      message: 'Failed to save file',
    });
  }

  return sendNoContent(event);
});

import sharp from 'sharp';
import { eq } from '@zeity/database';
import { users } from '@zeity/database/user';

import { saveStorageFile } from '~~/server/utils/storage';
import { checkFileSize, checkMimeType } from '~~/server/utils/image';

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

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
    const key = `user/${session.user.id}/${fileName}`;

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
      .update(users)
      .set({ image: key })
      .where(eq(users.id, session.user.id));
  } catch (error) {
    console.error('Error saving file:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to save file',
    });
  }

  return sendNoContent(event);
});

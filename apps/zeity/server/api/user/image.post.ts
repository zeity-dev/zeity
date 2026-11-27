import { createError, defineHandler } from 'nuxt/server';
import sharp from 'sharp';
import { requireUserSession } from '#imports';
import { useDrizzle } from '#server/utils/drizzle';
import { eq } from '@zeity/database';
import { users } from '@zeity/database/user';
import { checkFileSize, checkMimeType } from '~~/server/utils/image';
import { saveStorageFile } from '~~/server/utils/storage';

export default defineHandler(async event => {
  const session = await requireUserSession(event);

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
    const key = `user/${session.user.id}/${fileName}`;

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

    await useDrizzle().update(users).set({ image: key }).where(eq(users.id, session.user.id));
  } catch (error) {
    console.error('Error saving file:', error);
    throw createError({
      status: 500,
      message: 'Failed to save file',
    });
  }

  return new Response(null, { status: 204 });
});

import { createError, defineEventHandler } from 'nuxt/server';
import { isReady } from '../utils/readyness';

export default defineEventHandler(async () => {
  if (!isReady()) {
    throw createError({
      status: 400,
      message: 'Service is not ready',
    });
  }

  return { ok: true };
});

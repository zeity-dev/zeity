import { isReady } from '../utils/readyness';

export default eventHandler(async () => {
  if (!isReady()) {
    throw createError({
      status: 400,
      message: 'Service is not ready',
    });
  }

  return { ok: true };
});

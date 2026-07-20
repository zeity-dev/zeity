// import { useDrizzleMigration } from '../utils/drizzle';

export default defineNitroPlugin(async () => {
  if (import.meta.prerender) {
    return;
  }

  // await useDrizzleMigration().run();
});

import { useDrizzleMigration } from '../utils/drizzle';

export default async function migrateDatabase() {
  if (import.meta.prerender) {
    return;
  }

  await useDrizzleMigration().run();
}

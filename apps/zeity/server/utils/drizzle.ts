import { createConsola } from 'consola';

import { createDrizzle, createDrizzleMigration, createPool } from '@zeity/database';
import { setReady } from './readyness';

export { sql, gte, lte, gt, lt, eq, and, or, asc, desc } from '@zeity/database';

const logger = createConsola({}).withTag('db');

const pool = createPool(useRuntimeConfig().DATABASE_URL);

export function useDrizzle() {
  const db = createDrizzle(pool);
  return db;
}

export async function checkConnection() {
  try {
    await useDrizzle().execute(`select 1`);

    return true;
  } catch (error) {
    logger.error('Error executing ping:', error);
    return false;
  }
}

export function useDrizzleMigration() {
  const migrationsPath = process.env.MIGRATIONS_PATH || '../../libs/database/migrations';

  return {
    async run() {
      try {
        await createDrizzleMigration(pool, migrationsPath);
        logger.success('schema and db migrated');

        setReady('migrations', true);
      } catch (error) {
        logger.fail('schema and db migrated');
        logger.error(error);
      }
    },
  };
}

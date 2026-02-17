import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import * as schema from './schema';

export {
  count,
  sql,
  gte,
  lte,
  gt,
  lt,
  eq,
  ilike,
  inArray,
  notInArray,
  and,
  or,
  asc,
  desc,
  isNotNull,
} from 'drizzle-orm';

export function createPool(connectionString: string) {
  return new pg.Pool({
    connectionString,
  });
}

export function createDrizzle(pool: pg.Pool) {
  return drizzle({ client: pool, schema });
}

export function createDrizzleMigration(
  pool: pg.Pool,
  migrationsFolder: string
) {
  return migrate(createDrizzle(pool), {
    migrationsFolder,
  });
}

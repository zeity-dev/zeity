import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import * as schema from './schema';

export {
  type SQL,
  type SQLWrapper,
  count,
  sql,
  gte,
  lte,
  gt,
  lt,
  between,
  eq,
  ne,
  ilike,
  inArray,
  notInArray,
  arrayContains,
  and,
  or,
  asc,
  desc,
  isNotNull,
  isNull,
} from 'drizzle-orm';

export function createPool(connectionString: string) {
  return new pg.Pool({
    connectionString,
  });
}

export function createDrizzle(pool: pg.Pool) {
  return drizzle({ client: pool, schema });
}

export function createDrizzleMigration(pool: pg.Pool, migrationsFolder: string) {
  return migrate(createDrizzle(pool), {
    migrationsFolder,
  });
}

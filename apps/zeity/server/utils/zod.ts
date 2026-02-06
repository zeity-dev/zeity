import type { ZodType } from 'zod';
import { z } from 'zod';

export function coerceArray<T extends ZodType>(schema: T) {
  return z
    .union([schema, z.array(schema)])
    .transform((rel) => (Array.isArray(rel) ? rel : [rel]) as T['_output'][]);
}

export function nonEmptyString<T extends ZodType>(schema: T) {
  return z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    schema,
  );
}

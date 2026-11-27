import type { RequestEvent } from 'nuxt/server';
import { getRouterParams } from 'nuxt/server';
import { type ZodType, z } from 'zod';

/**
 * reimplemented router param validation from h3
 * @deprecated Use the built-in router param validation once available in nuxt/server
 */
export async function getSafeRouterParams<Result>(
  event: Pick<RequestEvent, 'context'>,
  validate: (params: Record<string, string | undefined>) => Result | Promise<Result>,
) {
  return await validate(getRouterParams(event, { decode: true }));
}

export function coerceArray<T extends ZodType>(schema: T) {
  return z
    .union([schema, z.array(schema)])
    .transform(rel => (Array.isArray(rel) ? rel : [rel]) as T['_output'][]);
}

export function nonEmptyString<T extends ZodType>(schema: T) {
  return z.preprocess(
    val => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    schema,
  );
}

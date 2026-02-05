import {
  type ZonedDateTime,
  getLocalTimeZone,
  parseAbsolute,
} from '@internationalized/date';
import { addMilliseconds } from 'date-fns';
import { nanoid } from 'nanoid';
import z from 'zod';

import {
  TIME_TYPE_MANUAL,
  TIME_TYPES,
  type DraftTime,
  type Time,
} from '@zeity/types';
import { timeDiff } from '@zeity/utils/date';
import { pick } from '@zeity/utils/object';

export const timeSchema = z.object({
  id: z.string().default(nanoid),
  type: z.enum(TIME_TYPES).default(TIME_TYPE_MANUAL),
  start: z.custom<ZonedDateTime>(),
  end: z.custom<ZonedDateTime>(),
  notes: z.string().default(''),

  projectId: z.optional(z.string()),
});
const draftSchema = timeSchema.pick({
  type: true,
  start: true,
  notes: true,
  projectId: true,
});
export const schema = z.union([timeSchema, draftSchema]);

export type Schema = z.infer<typeof schema>;

export function parseSchema(data: Schema) {
  let duration: number | undefined;

  const start = data.start.toAbsoluteString();
  const end = 'end' in data ? data.end.toAbsoluteString() : undefined;
  if (end) {
    duration = timeDiff(end, start);
  }

  let id: string | undefined;
  if ('id' in data) {
    id = data.id;
  }

  // Time contain id and duration
  if (id !== undefined && duration !== undefined) {
    return {
      ...pick(data, ['type', 'notes', 'projectId']),
      id,
      start,
      duration,
    } satisfies Time;
  }

  // otherwise, it's a draft
  return {
    ...pick(data, ['type', 'notes', 'projectId']),
    start,
  } satisfies DraftTime;
}

export function toSchema(data?: DraftTime | Time): Schema | undefined {
  if (!data) return undefined;

  const clone = Object.assign({}, data);

  const tz = getLocalTimeZone();
  if (isTimeValue(clone)) {
    const start = new Date(clone.start);
    const end = addMilliseconds(start, clone.duration);

    return {
      id: clone.id,
      type: clone.type,
      start: parseAbsolute(clone.start, tz).set({ millisecond: 0 }),
      end: parseAbsolute(end.toISOString(), tz).set({ millisecond: 0 }),
      notes: clone.notes || '',
      projectId: clone.projectId || undefined,
    } satisfies Schema;
  } else if (isDraftValue(clone)) {
    return {
      ...clone,
      start: parseAbsolute(clone.start, tz).set({ millisecond: 0 }),
    } as Schema;
  }
}

export function isDraftValue(
  value: Time | DraftTime | Schema | undefined | null,
): value is DraftTime {
  return !!value && !('duration' in value) && !('end' in value);
}
export function isTimeValue(
  value?: Time | DraftTime | Schema | undefined | null,
): value is Time {
  if (!value) return false;

  return ('id' in value && 'duration' in value) || 'end' in value;
}

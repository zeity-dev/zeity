import {
  differenceInDays,
  millisecondsToSeconds,
  minutesToHours,
  roundToNearestMinutes,
  secondsToMinutes,
  setMilliseconds,
} from 'date-fns';
import {
  millisecondsInSecond,
  minutesInHour,
  secondsInMinute,
} from 'date-fns/constants';

import { padLeft } from '../string';
import {
  getDateFormatter,
  getNumericDateFormatter,
  getRelativeDateFormatter,
} from '../formatter/date.formatter';
import { getTimeFormatter } from '../formatter/time.formatter';

type RoundingMethod = 'ceil' | 'floor' | 'round';
interface RoundingOptions {
  roundingMethod: RoundingMethod;
}

// const durationFormat = new Intl.DateTimeFormat(undefined, {
//   hour: '2-digit',
//   minute: '2-digit',
//   second: '2-digit',
//   timeZone: 'UTC',
//   hourCycle: 'h23',
// });

export type DateLike = number | string | Date;

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.valueOf());
}

export function dateToMilliseconds(value: DateLike) {
  if (typeof value === 'number') {
    return value;
  }
  return parseDate(value).getTime();
}

export function timeDiff(a: DateLike, b: DateLike) {
  return dateToMilliseconds(a) - dateToMilliseconds(b);
}

export function dayDiff(a: DateLike, b: DateLike) {
  const date = parseDate(a);
  const compare = parseDate(b);

  return differenceInDays(compare, date);
}

export function calculateDiffSum(
  items: { start: DateLike; duration: number }[]
): number {
  let sum = 0;

  for (const item of items) {
    sum += item.duration;
  }

  return sum;
}

export function millisecondsToDuration(milliseconds: number) {
  const fullSeconds = millisecondsToSeconds(milliseconds);
  const fullMinutes = secondsToMinutes(fullSeconds);
  const fullHours = minutesToHours(fullMinutes);

  return {
    seconds: fullSeconds % secondsInMinute,
    minutes: fullMinutes % minutesInHour,
    hours: fullHours,
  };
}

export function formatDuration(milliseconds: number) {
  const duration = millisecondsToDuration(milliseconds);

  return [
    padLeft(duration.hours, 2, '0'),
    padLeft(duration.minutes, 2, '0'),
    padLeft(duration.seconds, 2, '0'),
  ].join(':');
}

export function formatTime(value: DateLike, locale?: string) {
  const date = parseDate(value);
  return getTimeFormatter(locale).format(date);
}

export function formatDate(value: DateLike, locale?: string) {
  const date = parseDate(value);
  return getDateFormatter(locale).format(date);
}

export function formatNumericDate(value: DateLike, locale?: string) {
  const date = parseDate(value);
  return getNumericDateFormatter(locale).format(date);
}

export function formatRelativeDate(
  value: DateLike,
  compare: DateLike = new Date(),
  locale?: string
) {
  const diff = dayDiff(value, compare);

  return formatRelativeDateDiff(diff, locale);
}

export function formatRelativeDateDiff(value: number, locale?: string) {
  return getRelativeDateFormatter(locale).format(value, 'day');
}

export function sortDatesAscending(
  a: string | undefined | null,
  b: string | undefined | null
) {
  if (a && b) {
    return a.localeCompare(b);
  }
  if (a) {
    return 1;
  }
  if (b) {
    return -1;
  }

  return 0;
}

export function sortDatesDescending(
  a: string | undefined | null,
  b: string | undefined | null
) {
  return -sortDatesAscending(a, b);
}

export function parseDate(value: DateLike) {
  if (!value) {
    return new Date();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }

  return value;
}

export function parseTime(value: string) {
  const split = value.split(':');

  const hour = parseInt(split?.[0] ?? '0', 10);
  const minute = parseInt(split?.[1] ?? '0', 10);
  const second = parseInt(split?.[2] ?? '0', 10);

  return { hour, minute, second };
}

export function toStartOfDay(value: DateLike) {
  const date = parseDate(value);

  date.setHours(0, 0, 0, 0);

  return date;
}

export function nowWithoutMillis() {
  return setMilliseconds(new Date(), 0);
}

export function roundToSeconds(
  value: DateLike,
  options?: RoundingOptions
): Date {
  const date = parseDate(value);

  const milliseconds = date.getMilliseconds();
  const second = date.getSeconds() + milliseconds / millisecondsInSecond;
  const roundingMethod = getRoundingMethod(options?.roundingMethod);
  const roundSeconds = roundingMethod(second);

  date.setSeconds(roundSeconds, 0);

  return date;
}

export function roundToMinutes(
  value: DateLike,
  options?: RoundingOptions
): Date {
  const date = parseDate(value);

  return roundToNearestMinutes(date, options);
}

export function toISOString(value: DateLike) {
  if (typeof value === 'string') {
    return value;
  }

  return parseDate(value).toISOString();
}

function getRoundingMethod(method?: RoundingMethod) {
  switch (method) {
    case 'ceil':
      return Math.ceil;

    case 'floor':
      return Math.floor;

    case 'round':
    default:
      return Math.round;
  }
}

export function isSameDay(a: DateLike, b: DateLike) {
  const dateA = parseDate(a);
  const dateB = parseDate(b);

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}
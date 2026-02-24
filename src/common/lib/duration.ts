const UNITS = [
  'years',
  'months',
  'days',
  'hours',
  'minutes',
  'seconds',
  'milliseconds',
] as const;

type Unit = (typeof UNITS)[number];

export type Duration = Record<Unit, number>;

export function intervalToDuration({
  start,
  end,
}: {
  start: Date;
  end: Date;
}): Duration {
  let offset = new Date(start.getTime());
  const e = end;

  const result: Duration = {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  };

  // Years
  result.years = e.getUTCFullYear() - offset.getUTCFullYear();
  offset = addUTCYears(offset, result.years);
  if (offset > e) {
    result.years -= 1;
    offset = addUTCYears(new Date(start.getTime()), result.years);
  }

  // Months
  result.months =
    e.getUTCMonth() -
    offset.getUTCMonth() +
    (e.getUTCFullYear() - offset.getUTCFullYear()) * 12;
  offset = addUTCMonths(offset, result.months);
  if (offset > e) {
    result.months -= 1;
    offset = addUTCMonths(
      addUTCYears(new Date(start.getTime()), result.years),
      result.months,
    );
  }

  // Days
  const dayDiff = Math.floor(
    (e.getTime() - offset.getTime()) / (1000 * 60 * 60 * 24),
  );
  result.days = dayDiff;
  offset = new Date(offset.getTime() + dayDiff * 1000 * 60 * 60 * 24);

  // Hours
  const hourDiff = Math.floor(
    (e.getTime() - offset.getTime()) / (1000 * 60 * 60),
  );
  result.hours = hourDiff;
  offset = new Date(offset.getTime() + hourDiff * 1000 * 60 * 60);

  // Minutes
  const minDiff = Math.floor((e.getTime() - offset.getTime()) / (1000 * 60));
  result.minutes = minDiff;
  offset = new Date(offset.getTime() + minDiff * 1000 * 60);

  // Seconds
  const secDiff = Math.floor((e.getTime() - offset.getTime()) / 1000);
  result.seconds = secDiff;
  offset = new Date(offset.getTime() + secDiff * 1000);

  // Milliseconds
  result.milliseconds = e.getTime() - offset.getTime();

  return result;
}

type Format = 'full' | 'abbreviated' | 'compact';

const FULL_LABELS: Record<Unit, [string, string]> = {
  years: ['year', 'years'],
  months: ['month', 'months'],
  days: ['day', 'days'],
  hours: ['hour', 'hours'],
  minutes: ['minute', 'minutes'],
  seconds: ['second', 'seconds'],
  milliseconds: ['millisecond', 'milliseconds'],
};

const ABBREVIATED_LABELS: Record<Unit, string> = {
  years: 'yr',
  months: 'mo',
  days: 'd',
  hours: 'h',
  minutes: 'm',
  seconds: 's',
  milliseconds: 'ms',
};

type FormatDurationOptions = {
  format?: Format;
  precision?: number;
};

export function formatDuration(
  duration: Duration,
  options?: FormatDurationOptions,
): string {
  const { format = 'abbreviated', precision = 0 } = options ?? {};

  if (format === 'compact') {
    return formatCompact(duration, precision);
  }

  const isUnderTwoSeconds =
    duration.years === 0 &&
    duration.months === 0 &&
    duration.days === 0 &&
    duration.hours === 0 &&
    duration.minutes === 0 &&
    duration.seconds < 2;

  const parts = UNITS.filter(
    (unit) =>
      duration[unit] > 0 && (unit !== 'milliseconds' || isUnderTwoSeconds),
  ).map((unit) => {
    if (format === 'abbreviated') {
      return `${duration[unit]}${ABBREVIATED_LABELS[unit]}`;
    }
    const [singular, plural] = FULL_LABELS[unit];
    return `${duration[unit]} ${duration[unit] === 1 ? singular : plural}`;
  });

  if (precision > 0) {
    return parts.slice(0, precision).join(' ');
  }

  return parts.join(' ');
}

const DATE_UNITS = ['years', 'months', 'days'] as const;

function formatCompact(duration: Duration, precision: number): string {
  const dateParts = DATE_UNITS.filter((unit) => duration[unit] > 0).map(
    (unit) => `${duration[unit]}${ABBREVIATED_LABELS[unit]}`,
  );

  const { hours, minutes, seconds, milliseconds } = duration;
  const hasTime = hours > 0 || minutes > 0 || seconds > 0 || milliseconds > 0;
  let timePart = '';
  if (hasTime) {
    const ms = milliseconds > 0 ? String(milliseconds).padStart(3, '0') : '';

    if (hours > 0) {
      timePart = `${hours}:${pad(minutes)}'${pad(seconds)}"${ms}`;
    } else if (minutes > 0) {
      timePart = `${minutes}'${pad(seconds)}"${ms}`;
    } else if (ms) {
      timePart = `${seconds}"${ms}`;
    } else {
      timePart = `${seconds}"`;
    }
  }

  const allParts = [...dateParts, timePart].filter(Boolean);

  if (precision > 0) {
    return allParts.slice(0, precision).join(' ');
  }

  return allParts.join(' ');
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export const getDuration = (
  start: Date,
  end: Date,
  options?: FormatDurationOptions,
) => formatDuration(intervalToDuration({ start, end }), options);

function addUTCYears(date: Date, years: number): Date {
  const result = new Date(date.getTime());
  result.setUTCFullYear(result.getUTCFullYear() + years);
  return result;
}

function addUTCMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

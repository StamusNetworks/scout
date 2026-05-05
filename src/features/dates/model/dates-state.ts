/**
 * Date-range filter state. Four modes — open-ended (`all`), absolute
 * (`range`), relative (`from`), and auto-fitted to the data (`auto`).
 * `start_date` / `end_date` are epoch milliseconds; the wire-shape
 * stays here for now and will migrate to a `DateRange` value object
 * when downstream features adopt it.
 */
export type DatesState = {
  start_date: number | undefined;
  end_date: number | undefined;
  type: 'all' | 'range' | 'from' | 'auto';
  from_duration: number | undefined;
  from_unit: TimeUnit | undefined;
};

export type DatesPayload =
  | { type: 'all' }
  | { type: 'range'; start_date: number; end_date: number }
  | { type: 'auto'; start_date: number; end_date: number }
  | {
      type: 'from';
      from_duration: number;
      from_unit: TimeUnit;
    };

export const TIME_PRESETS: { duration: number; unit: TimeUnit }[] = [
  { duration: 1, unit: 'years' },
  { duration: 30, unit: 'days' },
  { duration: 7, unit: 'days' },
  { duration: 2, unit: 'days' },
  { duration: 24, unit: 'hours' },
  { duration: 6, unit: 'hours' },
  { duration: 1, unit: 'hours' },
];

export const units = {
  seconds: 'seconds',
  minutes: 'minutes',
  hours: 'hours',
  days: 'days',
  weeks: 'weeks',
  months: 'months',
  years: 'years',
} as const;
export type TimeUnit = (typeof units)[keyof typeof units];

export const formatUnit = (unit: TimeUnit, value: number) =>
  value <= 1 ? unit.slice(0, -1) : unit;

export const UNITS_IN_MILLISECONDS: Record<TimeUnit, number> = {
  seconds: 1 * 1000,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 60 * 60 * 24 * 1000,
  weeks: 60 * 60 * 24 * 7 * 1000,
  months: 60 * 60 * 24 * 30 * 1000,
  years: 60 * 60 * 24 * 365 * 1000,
} as const;

/**
 * Pure: collapse a `DatesState` into an absolute `[start_date, end_date]`
 * window. `all` widens to "since epoch → now"; `range`/`from`/`auto`
 * pass through their stored values. Used by query builders that always
 * need concrete bounds.
 */
const nowCeiledToMinute = () => Math.ceil(Date.now() / 60_000) * 60_000;

export const computeDates = (
  dates: DatesState,
): { start_date: number; end_date: number } => {
  if (dates.type === 'all') {
    return { start_date: 0, end_date: nowCeiledToMinute() };
  }
  if (
    (dates.type === 'range' ||
      dates.type === 'from' ||
      dates.type === 'auto') &&
    dates.start_date &&
    dates.end_date
  ) {
    return { start_date: dates.start_date, end_date: dates.end_date };
  }
  return { start_date: 0, end_date: nowCeiledToMinute() };
};

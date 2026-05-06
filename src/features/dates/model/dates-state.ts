/**
 * Date-range filter state. Four modes — open-ended (`all`), absolute
 * (`range`), relative (`from`), and auto-fitted to the data (`auto`).
 * `from` and `to` are epoch milliseconds (domain shape — kept as plain
 * numbers so the slice stays serializable). The wire translation
 * (`start_date`/`end_date` epoch seconds for postgres,
 * `from_date`/`to_date` epoch milliseconds for elastic) happens in
 * `buildQueryParams`.
 */
export type DatesState = {
  from: number | undefined;
  to: number | undefined;
  type: 'all' | 'range' | 'from' | 'auto';
  from_duration: number | undefined;
  from_unit: TimeUnit | undefined;
};

export type DatesPayload =
  | { type: 'all' }
  | { type: 'range'; from: number; to: number }
  | { type: 'auto'; from: number; to: number }
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
 * Pure: collapse a `DatesState` into an absolute `DateRange`. `all`
 * widens to "since epoch → now"; `range`/`from`/`auto` pass through
 * their stored values. Used by query builders that always need
 * concrete bounds.
 */
const nowCeiledToMinute = () => Math.ceil(Date.now() / 60_000) * 60_000;

export const computeDates = (
  dates: DatesState,
): { from: number; to: number } => {
  if (dates.type === 'all') {
    return { from: 0, to: nowCeiledToMinute() };
  }
  if (
    (dates.type === 'range' ||
      dates.type === 'from' ||
      dates.type === 'auto') &&
    dates.from &&
    dates.to
  ) {
    return { from: dates.from, to: dates.to };
  }
  return { from: 0, to: nowCeiledToMinute() };
};

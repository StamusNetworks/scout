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
  {
    duration: 1,
    unit: 'years',
  },
  {
    duration: 30,
    unit: 'days',
  },
  {
    duration: 7,
    unit: 'days',
  },
  {
    duration: 2,
    unit: 'days',
  },
  {
    duration: 24,
    unit: 'hours',
  },
  {
    duration: 6,
    unit: 'hours',
  },
  {
    duration: 1,
    unit: 'hours',
  },
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

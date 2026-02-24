import { describe, expect, it } from 'vitest';

import { formatDuration, intervalToDuration } from './duration';

describe('intervalToDuration', () => {
  it('returns all zeros for identical dates', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    expect(intervalToDuration({ start: date, end: date })).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
  });

  it('computes milliseconds', () => {
    const start = new Date('2024-01-01T00:00:00.000Z');
    const end = new Date('2024-01-01T00:00:00.500Z');
    const result = intervalToDuration({ start, end });
    expect(result.milliseconds).toBe(500);
    expect(result.seconds).toBe(0);
  });

  it('computes seconds and milliseconds', () => {
    const start = new Date('2024-01-01T00:00:00.000Z');
    const end = new Date('2024-01-01T00:00:02.300Z');
    const result = intervalToDuration({ start, end });
    expect(result.seconds).toBe(2);
    expect(result.milliseconds).toBe(300);
  });

  it('computes full duration across all units', () => {
    const start = new Date('2022-03-10T08:30:15.100Z');
    const end = new Date('2024-07-14T11:45:20.600Z');
    const result = intervalToDuration({ start, end });
    expect(result.years).toBe(2);
    expect(result.months).toBe(4);
    expect(result.days).toBe(4);
    expect(result.hours).toBe(3);
    expect(result.minutes).toBe(15);
    expect(result.seconds).toBe(5);
    expect(result.milliseconds).toBe(500);
  });

  it('handles sub-second durations', () => {
    const start = new Date('2024-01-01T00:00:00.000Z');
    const end = new Date('2024-01-01T00:00:00.050Z');
    const result = intervalToDuration({ start, end });
    expect(result).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 50,
    });
  });
});

describe('formatDuration', () => {
  const allUnits = {
    years: 1,
    months: 2,
    days: 3,
    hours: 4,
    minutes: 5,
    seconds: 6,
    milliseconds: 7,
  };

  const zero = {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  };

  describe('abbreviated format (default)', () => {
    it('formats all non-zero units, omitting milliseconds when larger units exist', () => {
      expect(formatDuration(allUnits)).toBe('1yr 2mo 3d 4h 5m 6s');
    });

    it('shows milliseconds when duration is under 2 seconds', () => {
      expect(formatDuration({ ...zero, seconds: 1, milliseconds: 300 })).toBe(
        '1s 300ms',
      );
    });

    it('hides milliseconds when duration is 2 seconds or more', () => {
      expect(formatDuration({ ...zero, seconds: 2, milliseconds: 300 })).toBe(
        '2s',
      );
    });

    it('skips zero values', () => {
      expect(formatDuration({ ...zero, hours: 2, seconds: 30 })).toBe('2h 30s');
    });

    it('shows milliseconds when only milliseconds', () => {
      expect(formatDuration({ ...zero, milliseconds: 500 })).toBe('500ms');
    });

    it('returns empty string for all-zero duration', () => {
      expect(formatDuration(zero)).toBe('');
    });

    it('respects precision option', () => {
      expect(formatDuration(allUnits, { precision: 3 })).toBe('1yr 2mo 3d');
    });
  });

  describe('full format', () => {
    it('formats all non-zero units, omitting milliseconds when larger units exist', () => {
      expect(formatDuration(allUnits, { format: 'full' })).toBe(
        '1 year 2 months 3 days 4 hours 5 minutes 6 seconds',
      );
    });

    it('uses singular form for value of 1', () => {
      const ones = {
        years: 1,
        months: 1,
        days: 1,
        hours: 1,
        minutes: 1,
        seconds: 1,
        milliseconds: 1,
      };
      expect(formatDuration(ones, { format: 'full' })).toBe(
        '1 year 1 month 1 day 1 hour 1 minute 1 second',
      );
    });

    it('shows milliseconds when duration is under 2 seconds', () => {
      expect(
        formatDuration(
          { ...zero, seconds: 1, milliseconds: 300 },
          { format: 'full' },
        ),
      ).toBe('1 second 300 milliseconds');
    });

    it('hides milliseconds when duration is 2 seconds or more', () => {
      expect(
        formatDuration(
          { ...zero, seconds: 2, milliseconds: 300 },
          { format: 'full' },
        ),
      ).toBe('2 seconds');
    });

    it('respects precision option', () => {
      const duration = { ...zero, years: 2, months: 4, days: 3, hours: 2 };
      expect(formatDuration(duration, { format: 'full', precision: 2 })).toBe(
        '2 years 4 months',
      );
    });
  });

  describe('compact format', () => {
    it('formats hours:minutes:seconds with milliseconds', () => {
      expect(
        formatDuration(
          { ...zero, hours: 2, minutes: 1, seconds: 54, milliseconds: 321 },
          { format: 'compact' },
        ),
      ).toBe(`2:01'54"321`);
    });

    it('formats minutes:seconds with milliseconds', () => {
      expect(
        formatDuration(
          { ...zero, minutes: 1, seconds: 54, milliseconds: 321 },
          { format: 'compact' },
        ),
      ).toBe(`1'54"321`);
    });

    it('formats seconds with milliseconds', () => {
      expect(
        formatDuration(
          { ...zero, seconds: 5, milliseconds: 50 },
          { format: 'compact' },
        ),
      ).toBe(`5"050`);
    });

    it('formats seconds without milliseconds', () => {
      expect(
        formatDuration({ ...zero, seconds: 42 }, { format: 'compact' }),
      ).toBe(`42"`);
    });

    it('formats milliseconds only', () => {
      expect(
        formatDuration({ ...zero, milliseconds: 50 }, { format: 'compact' }),
      ).toBe(`0"050`);
    });

    it('prefixes date units before time', () => {
      expect(
        formatDuration(
          {
            years: 2,
            months: 4,
            days: 3,
            hours: 2,
            minutes: 1,
            seconds: 54,
            milliseconds: 321,
          },
          { format: 'compact' },
        ),
      ).toBe(`2yr 4mo 3d 2:01'54"321`);
    });

    it('formats date-only durations', () => {
      expect(
        formatDuration({ ...zero, years: 1, months: 6 }, { format: 'compact' }),
      ).toBe('1yr 6mo');
    });

    it('respects precision option', () => {
      expect(
        formatDuration(
          {
            years: 2,
            months: 4,
            days: 3,
            hours: 2,
            minutes: 1,
            seconds: 54,
            milliseconds: 321,
          },
          { format: 'compact', precision: 2 },
        ),
      ).toBe('2yr 4mo');
    });

    it('returns empty string for all-zero duration', () => {
      expect(formatDuration(zero, { format: 'compact' })).toBe('');
    });
  });
});

import { describe, expect, it } from 'vitest';

import {
  computeInterval,
  DEFAULT_ENABLED_SERIES,
  TIMELINE_SERIES,
} from './timeline-series';

describe('computeInterval', () => {
  it('returns 0 for empty array', () => {
    expect(computeInterval([])).toBe(0);
  });

  it('returns 0 for single point', () => {
    expect(computeInterval([{ time: 1000 }])).toBe(0);
  });

  it('returns difference between first two points', () => {
    expect(
      computeInterval([{ time: 1000 }, { time: 4000 }, { time: 9000 }]),
    ).toBe(3000);
  });
});

describe('DEFAULT_ENABLED_SERIES', () => {
  it('contains the expected default series', () => {
    expect(DEFAULT_ENABLED_SERIES).toEqual([
      'networkEvents',
      'compromises',
      'outlierEvents',
    ]);
  });

  it('matches series with defaultEnabled: true', () => {
    const fromConfig = TIMELINE_SERIES.filter((s) => s.defaultEnabled).map(
      (s) => s.key,
    );
    expect(DEFAULT_ENABLED_SERIES).toEqual(fromConfig);
  });
});

describe('TIMELINE_SERIES', () => {
  it('has unique keys', () => {
    const keys = TIMELINE_SERIES.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('has 7 series', () => {
    expect(TIMELINE_SERIES).toHaveLength(7);
  });
});

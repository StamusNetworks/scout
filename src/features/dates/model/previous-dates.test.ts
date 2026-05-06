import { describe, expect, test } from 'vitest';

import { computePreviousRange } from './previous-dates';

describe('computePreviousRange', () => {
  test('returns the prior window of the same length', () => {
    expect(computePreviousRange({ from: 100, to: 300 })).toEqual({
      from: -100,
      to: 100,
    });
  });

  test('handles a zero-width range', () => {
    expect(computePreviousRange({ from: 500, to: 500 })).toEqual({
      from: 500,
      to: 500,
    });
  });

  test('handles epoch-millisecond ranges', () => {
    const day = 24 * 60 * 60 * 1000;
    const now = 1_700_000_000_000;
    expect(computePreviousRange({ from: now - day, to: now })).toEqual({
      from: now - 2 * day,
      to: now - day,
    });
  });
});

import { describe, expect, test } from 'vitest';

import { joinCipherSecurityTimelines } from './cipher-security';

const point = (time: number, count: number) => ({ time, count });

describe('joinCipherSecurityTimelines', () => {
  test('returns undefined when any series is missing', () => {
    expect(joinCipherSecurityTimelines(undefined, [], [])).toBeUndefined();
    expect(joinCipherSecurityTimelines([], undefined, [])).toBeUndefined();
    expect(joinCipherSecurityTimelines([], [], undefined)).toBeUndefined();
  });

  test('joins three series by index', () => {
    expect(
      joinCipherSecurityTimelines(
        [point(1, 10), point(2, 20)],
        [point(1, 5), point(2, 6)],
        [point(1, 1), point(2, 2)],
      ),
    ).toEqual([
      { time: 1, count: 10, recommended: 10, insecure: 5, degraded: 1 },
      { time: 2, count: 20, recommended: 20, insecure: 6, degraded: 2 },
    ]);
  });

  test('uses recommended length to drive the output', () => {
    expect(
      joinCipherSecurityTimelines(
        [point(1, 10)],
        [point(1, 5), point(2, 6)],
        [point(1, 1), point(2, 2)],
      ),
    ).toHaveLength(1);
  });

  test('emits undefined when peer series have fewer points', () => {
    const result = joinCipherSecurityTimelines(
      [point(1, 10), point(2, 20)],
      [point(1, 5)],
      [point(1, 1)],
    );
    expect(result?.[1]).toMatchObject({
      time: 2,
      insecure: undefined,
      degraded: undefined,
    });
  });
});

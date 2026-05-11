import { describe, expect, it } from 'vitest';

import { computeRunStats, type QueryRunResult } from './run-stats';

const empty: QueryRunResult = {
  data: { results: [] },
  isLoading: false,
  isError: false,
};
const loading: QueryRunResult = {
  data: undefined,
  isLoading: true,
  isError: false,
};
const errored: QueryRunResult = {
  data: undefined,
  isLoading: false,
  isError: true,
};
const withHits: QueryRunResult = {
  data: { results: [{ timestamp: '2026-01-01' }] },
  isLoading: false,
  isError: false,
};

describe('computeRunStats', () => {
  it('reports a total equal to the input length', () => {
    expect(computeRunStats([empty, empty, empty]).total).toBe(3);
  });

  it('returns zero withResults and zero errored for an all-empty input', () => {
    const stats = computeRunStats([empty, empty]);
    expect(stats.withResults).toBe(0);
    expect(stats.errored).toBe(0);
  });

  it('counts queries with at least one event toward withResults', () => {
    const stats = computeRunStats([withHits, empty, withHits, empty]);
    expect(stats.withResults).toBe(2);
  });

  it('counts errored queries as errored, not as withResults', () => {
    const stats = computeRunStats([errored, errored, withHits, empty]);
    expect(stats).toEqual({ total: 4, withResults: 1, errored: 2 });
  });

  it('does not count inflight queries toward withResults', () => {
    const stats = computeRunStats([loading, loading, withHits, empty]);
    expect(stats).toEqual({ total: 4, withResults: 1, errored: 0 });
  });

  it('returns all-zero stats for empty input', () => {
    expect(computeRunStats([])).toEqual({
      total: 0,
      withResults: 0,
      errored: 0,
    });
  });
});

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/events/api/events.api', () => ({
  useGetEventsQuery: vi.fn(),
  useGetEventsTailQuery: vi.fn(),
}));

import { useGetEventsQuery, useGetEventsTailQuery } from '@/features/events';
import { makeLateralEvent, makeNrdEvent } from '@/features/events';

import { useNetworkHuntingTrail } from './use-network-hunting-trail';

const mockUseGetEventsQuery = vi.mocked(useGetEventsQuery);
const mockUseGetEventsTailQuery = vi.mocked(useGetEventsTailQuery);

const params = {
  from: new Date('2026-01-12T00:00:00Z').getTime(),
  to: new Date('2026-01-15T00:00:00Z').getTime(),
};

const emptyResult = {
  data: { results: [], count: 0 },
  isLoading: false,
  isFetching: false,
  isError: false,
} as unknown as ReturnType<typeof useGetEventsQuery>;

const loadingResult = {
  data: undefined,
  isLoading: true,
  isFetching: true,
  isError: false,
} as unknown as ReturnType<typeof useGetEventsQuery>;

const errorResult = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: true,
} as unknown as ReturnType<typeof useGetEventsQuery>;

describe('useNetworkHuntingTrail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isLoading for a group when its queries are still loading', () => {
    // First alert query (nrd) is loading, rest empty
    mockUseGetEventsQuery
      .mockReturnValueOnce(loadingResult)
      .mockReturnValue(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);

    const { result } = renderHook(() => useNetworkHuntingTrail(params));
    // DNS & Domains group contains nrd — should be loading
    expect(result.current.groups['dns-domains'].isLoading).toBe(true);
  });

  it('returns grouped events by purpose slug', () => {
    const nrdData = {
      ...emptyResult,
      data: { results: [makeNrdEvent()], count: 1 },
    } as unknown as ReturnType<typeof useGetEventsQuery>;

    const lateralData = {
      ...emptyResult,
      data: { results: [makeLateralEvent()], count: 1 },
    } as unknown as ReturnType<typeof useGetEventsQuery>;

    mockUseGetEventsQuery.mockImplementation((...args: unknown[]) => {
      const params = args[0] as { qfilter: string };
      if (params?.qfilter?.includes('stamus.nrd')) return nrdData;
      if (params?.qfilter?.includes('alert.lateral:*')) return lateralData;
      return emptyResult;
    });
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);

    const { result } = renderHook(() => useNetworkHuntingTrail(params));
    expect(result.current.groups['dns-domains'].count).toBe(1);
    expect(result.current.groups['dns-domains'].events).toHaveLength(1);
    expect(result.current.groups['lateral-movement'].count).toBe(1);
    expect(result.current.groups['lateral-movement'].events).toHaveLength(1);
  });

  it('returns isError for a group only when all its queries fail', () => {
    mockUseGetEventsQuery.mockReturnValue(errorResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);

    const { result } = renderHook(() => useNetworkHuntingTrail(params));
    expect(result.current.groups['lateral-movement'].isError).toBe(true);
    expect(result.current.groups['network-sessions'].isError).toBe(false);
  });

  it('excludes sightings — no events with timelineType sightings appear', () => {
    mockUseGetEventsQuery.mockReturnValue(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);

    const { result } = renderHook(() => useNetworkHuntingTrail(params));
    const allEvents = Object.values(result.current.groups).flatMap(
      (g) => g.events,
    );
    expect(allEvents.every((e) => e.timelineType !== 'sightings')).toBe(true);
  });

  it('returns empty counts for purposes with no events', () => {
    mockUseGetEventsQuery.mockReturnValue(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);

    const { result } = renderHook(() => useNetworkHuntingTrail(params));
    expect(result.current.groups['lateral-movement'].count).toBe(0);
    expect(result.current.groups['lateral-movement'].events).toHaveLength(0);
    expect(result.current.groups['lateral-movement'].isLoading).toBe(false);
    expect(result.current.groups['lateral-movement'].isError).toBe(false);
  });

  describe('runStats', () => {
    const withHits = {
      ...emptyResult,
      data: { results: [makeNrdEvent()], count: 1 },
    } as unknown as ReturnType<typeof useGetEventsQuery>;

    it('reports total=36 with zero results when all queries return empty (sightings excluded)', () => {
      mockUseGetEventsQuery.mockReturnValue(emptyResult);
      mockUseGetEventsTailQuery.mockReturnValue(emptyResult);
      const { result } = renderHook(() => useNetworkHuntingTrail(params));
      expect(result.current.runStats).toEqual({
        total: 36,
        withResults: 0,
        errored: 0,
      });
    });

    it('counts only queries with at least one event toward withResults', () => {
      mockUseGetEventsQuery
        .mockReturnValueOnce(withHits)
        .mockReturnValueOnce(withHits)
        .mockReturnValueOnce(withHits)
        .mockReturnValue(emptyResult);
      mockUseGetEventsTailQuery.mockReturnValue(emptyResult);
      const { result } = renderHook(() => useNetworkHuntingTrail(params));
      expect(result.current.runStats).toEqual({
        total: 36,
        withResults: 3,
        errored: 0,
      });
    });

    it('excludes errored queries from withResults and counts them as errored', () => {
      mockUseGetEventsQuery
        .mockReturnValueOnce(errorResult)
        .mockReturnValueOnce(errorResult)
        .mockReturnValueOnce(withHits)
        .mockReturnValueOnce(withHits)
        .mockReturnValueOnce(withHits)
        .mockReturnValueOnce(withHits)
        .mockReturnValue(emptyResult);
      mockUseGetEventsTailQuery.mockReturnValue(emptyResult);
      const { result } = renderHook(() => useNetworkHuntingTrail(params));
      expect(result.current.runStats).toEqual({
        total: 36,
        withResults: 4,
        errored: 2,
      });
    });

    it('does not count inflight queries toward withResults but counts them in total', () => {
      mockUseGetEventsQuery
        .mockReturnValueOnce(loadingResult)
        .mockReturnValueOnce(loadingResult)
        .mockReturnValueOnce(withHits)
        .mockReturnValue(emptyResult);
      mockUseGetEventsTailQuery.mockReturnValue(emptyResult);
      const { result } = renderHook(() => useNetworkHuntingTrail(params));
      expect(result.current.runStats).toEqual({
        total: 36,
        withResults: 1,
        errored: 0,
      });
    });
  });
});

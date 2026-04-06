import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/events/common/events.api', () => ({
  useGetEventsQuery: vi.fn(),
  useGetEventsTailQuery: vi.fn(),
}));
vi.mock('@/features/events/sightings/common/sightings.api', () => ({
  useGetSightingEventsQuery: vi.fn(),
}));

import {
  useGetEventsQuery,
  useGetEventsTailQuery,
} from '@/features/events/common/events.api';
import { makeNrdEvent } from '@/features/events/common/events.mocks';
import { useGetSightingEventsQuery } from '@/features/events/sightings/common/sightings.api';

import { useHostHuntingTrail } from './use-host-hunting-trail';

const mockUseGetEventsQuery = vi.mocked(useGetEventsQuery);
const mockUseGetEventsTailQuery = vi.mocked(useGetEventsTailQuery);
const mockUseGetSightingEventsQuery = vi.mocked(useGetSightingEventsQuery);

const params = {
  asset: '192.168.1.5',
  startDate: new Date('2026-01-12T00:00:00Z').getTime(),
  endDate: new Date('2026-01-15T00:00:00Z').getTime(),
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

describe('useHostHuntingTrail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isLoading: true when any query is still loading', () => {
    mockUseGetEventsQuery
      .mockReturnValueOnce(loadingResult)
      .mockReturnValue(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);
    mockUseGetSightingEventsQuery.mockReturnValue(
      emptyResult as unknown as ReturnType<typeof useGetSightingEventsQuery>,
    );
    const { result } = renderHook(() => useHostHuntingTrail(params));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isEmpty).toBe(false);
  });

  it('returns isError: true only when ALL queries have failed', () => {
    mockUseGetEventsQuery.mockReturnValue(errorResult);
    mockUseGetEventsTailQuery.mockReturnValue(errorResult);
    mockUseGetSightingEventsQuery.mockReturnValue(
      errorResult as unknown as ReturnType<typeof useGetSightingEventsQuery>,
    );
    const { result } = renderHook(() => useHostHuntingTrail(params));
    expect(result.current.isError).toBe(true);
    expect(result.current.isEmpty).toBe(false);
  });

  it('does not return isError: true when only some queries have failed', () => {
    mockUseGetEventsQuery
      .mockReturnValueOnce(errorResult)
      .mockReturnValue(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);
    mockUseGetSightingEventsQuery.mockReturnValue(
      emptyResult as unknown as ReturnType<typeof useGetSightingEventsQuery>,
    );
    const { result } = renderHook(() => useHostHuntingTrail(params));
    expect(result.current.isError).toBe(false);
  });

  it('returns isEmpty: true when all queries succeed with no results', () => {
    mockUseGetEventsQuery.mockReturnValue(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);
    mockUseGetSightingEventsQuery.mockReturnValue(
      emptyResult as unknown as ReturnType<typeof useGetSightingEventsQuery>,
    );
    const { result } = renderHook(() => useHostHuntingTrail(params));
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('returns isEmpty: false when there are results', () => {
    const withResults = {
      ...emptyResult,
      data: { results: [makeNrdEvent()], count: 1 },
    } as unknown as ReturnType<typeof useGetEventsQuery>;
    mockUseGetEventsQuery
      .mockReturnValueOnce(withResults)
      .mockReturnValue(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);
    mockUseGetSightingEventsQuery.mockReturnValue(
      emptyResult as unknown as ReturnType<typeof useGetSightingEventsQuery>,
    );
    const { result } = renderHook(() => useHostHuntingTrail(params));
    expect(result.current.isEmpty).toBe(false);
    expect(Object.values(result.current.groups).some((g) => g.count > 0)).toBe(
      true,
    );
  });
});

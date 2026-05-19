import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/filter-sets', () => ({
  useFilterSets: vi.fn(),
}));

vi.mock('@/features/query-filters', () => ({
  useQFBuilder: () => ({
    toQFString: () => 'STUB_QFILTER',
  }),
  useGlobalQueryParams: () => ({ tenant: undefined }),
}));

vi.mock('../api/hunting-trail.api', () => ({
  useGetHuntingTrailQuery: vi.fn(),
}));

import type { FilterSet } from '@/features/filter-sets';
import { useFilterSets } from '@/features/filter-sets';

import { useGetHuntingTrailQuery } from '../api/hunting-trail.api';
import { HUNTING_TRAIL_CONFIG } from '../definitions/hunting-trail.config';
import { useHuntingTrail } from './use-hunting-trail';

const mockUseFilterSets = vi.mocked(useFilterSets);
const mockUseGetHuntingTrailQuery = vi.mocked(useGetHuntingTrailQuery);

const range = {
  from: new Date('2026-01-12T00:00:00Z').getTime(),
  to: new Date('2026-01-15T00:00:00Z').getTime(),
};

const configFiltersetIds = HUNTING_TRAIL_CONFIG.groups
  .flatMap((g) => g.queries)
  .filter(
    (q): q is { id: string; kind: 'filterset'; filtersetId: number } =>
      q.kind === 'filterset',
  )
  .map((q) => q.filtersetId);

const makeFilterSet = (id: number, page = 'DASHBOARDS'): FilterSet => ({
  id,
  name: `Filter ${id}`,
  description: '',
  page,
  imported: false,
  share: 'static',
  filters: [],
  tags: {
    stamus: true,
    alert: true,
    discovery: true,
    informational: true,
    relevant: true,
    untagged: true,
  },
});

const allFilterSets: FilterSet[] = configFiltersetIds.map((id) =>
  makeFilterSet(id, id === -107 || id <= -99 ? 'SESSION_EVENTS' : 'DASHBOARDS'),
);

const stubEndpoint = (
  overrides: Partial<{
    data: unknown;
    isLoading: boolean;
    isError: boolean;
  }> = {},
) =>
  ({
    data: {},
    isLoading: false,
    isFetching: false,
    isError: false,
    ...overrides,
  }) as unknown as ReturnType<typeof useGetHuntingTrailQuery>;

const stubFilterSets = (
  overrides: Partial<{
    data: FilterSet[] | undefined;
    isLoading: boolean;
    isError: boolean;
  }> = {},
) =>
  ({
    data: allFilterSets,
    isLoading: false,
    isFetching: false,
    isError: false,
    ...overrides,
  }) as unknown as ReturnType<typeof useFilterSets>;

describe('useHuntingTrail (slice B)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isLoading: true while filter sets are loading', () => {
    mockUseFilterSets.mockReturnValue(
      stubFilterSets({ isLoading: true, data: undefined }),
    );
    mockUseGetHuntingTrailQuery.mockReturnValue(stubEndpoint());
    const { result } = renderHook(() => useHuntingTrail(range));
    expect(result.current.isLoading).toBe(true);
  });

  it('returns isError: true when filter sets fetch fails', () => {
    mockUseFilterSets.mockReturnValue(
      stubFilterSets({ isError: true, data: undefined }),
    );
    mockUseGetHuntingTrailQuery.mockReturnValue(stubEndpoint());
    const { result } = renderHook(() => useHuntingTrail(range));
    expect(result.current.isError).toBe(true);
  });

  it('returns isLoading: true while the hunting-trail endpoint is in flight', () => {
    mockUseFilterSets.mockReturnValue(stubFilterSets());
    mockUseGetHuntingTrailQuery.mockReturnValue(
      stubEndpoint({ isLoading: true }),
    );
    const { result } = renderHook(() => useHuntingTrail(range));
    expect(result.current.isLoading).toBe(true);
  });

  it('runStats.total equals the config query count (41)', () => {
    mockUseFilterSets.mockReturnValue(stubFilterSets());
    mockUseGetHuntingTrailQuery.mockReturnValue(
      stubEndpoint({
        data: Object.fromEntries(
          HUNTING_TRAIL_CONFIG.groups
            .flatMap((g) => g.queries)
            .map((q) => [q.id, { data: { results: [] } }]),
        ),
      }),
    );
    const { result } = renderHook(() => useHuntingTrail(range));
    expect(result.current.runStats.total).toBe(41);
    expect(result.current.runStats.withResults).toBe(0);
    expect(result.current.runStats.errored).toBe(0);
  });

  it('isEmpty: true when every per-query result has zero events', () => {
    mockUseFilterSets.mockReturnValue(stubFilterSets());
    mockUseGetHuntingTrailQuery.mockReturnValue(
      stubEndpoint({
        data: Object.fromEntries(
          HUNTING_TRAIL_CONFIG.groups
            .flatMap((g) => g.queries)
            .map((q) => [q.id, { data: { results: [] } }]),
        ),
      }),
    );
    const { result } = renderHook(() => useHuntingTrail(range));
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('counts missing filterset (a configured id absent from filter sets) toward errored', () => {
    // Drop one filterset id from the response so its query reports missing.
    const oneMissing = allFilterSets.filter((f) => f.id !== -88);
    mockUseFilterSets.mockReturnValue(stubFilterSets({ data: oneMissing }));
    mockUseGetHuntingTrailQuery.mockReturnValue(
      stubEndpoint({
        data: {
          nrd: { isError: true, errorReason: 'FILTERSET_MISSING' },
          ...Object.fromEntries(
            HUNTING_TRAIL_CONFIG.groups
              .flatMap((g) => g.queries)
              .filter((q) => q.id !== 'nrd')
              .map((q) => [q.id, { data: { results: [] } }]),
          ),
        },
      }),
    );
    const { result } = renderHook(() => useHuntingTrail(range));
    expect(result.current.runStats.total).toBe(41);
    expect(result.current.runStats.errored).toBeGreaterThanOrEqual(1);
  });

  it('groups events from result map into the correct PurposeSlug', () => {
    mockUseFilterSets.mockReturnValue(stubFilterSets());
    mockUseGetHuntingTrailQuery.mockReturnValue(
      stubEndpoint({
        data: {
          nrd: {
            data: {
              results: [{ _id: 'r1', timestamp: '2026-01-12T00:00:00Z' }],
            },
          },
          ...Object.fromEntries(
            HUNTING_TRAIL_CONFIG.groups
              .flatMap((g) => g.queries)
              .filter((q) => q.id !== 'nrd')
              .map((q) => [q.id, { data: { results: [] } }]),
          ),
        },
      }),
    );
    const { result } = renderHook(() => useHuntingTrail(range));
    expect(result.current.groups['dns-domains'].count).toBe(1);
    expect(result.current.groups['lateral-movement'].count).toBe(0);
  });

  it('exposes queryMetadata mapping query ids to {name, description}', () => {
    mockUseFilterSets.mockReturnValue(stubFilterSets());
    mockUseGetHuntingTrailQuery.mockReturnValue(stubEndpoint());
    const { result } = renderHook(() => useHuntingTrail(range));
    // Static entries carry their declared name from config
    expect(result.current.queryMetadata.sightings.name).toBe('Sightings');
    expect(result.current.queryMetadata.file.name).toBe('Fileinfo');
    expect(result.current.queryMetadata.dynamicDns.name).toBe('Dynamic DNS');
    // Filterset entries carry their filterset's name (from the mocked response)
    expect(result.current.queryMetadata.nrd.name).toBe('Filter -88');
  });
});

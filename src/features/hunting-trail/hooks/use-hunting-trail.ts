import { useMemo } from 'react';

import { useFilterSets } from '@/features/filter-sets';
import {
  type QueryFilterState,
  useGlobalQueryParams,
  useQFBuilder,
} from '@/features/query-filters';

import { useGetHuntingTrailQuery } from '../api/hunting-trail.api';
import {
  buildQueryParams,
  type ResolvedQuery,
} from '../builders/build-query-params';
import { HUNTING_TRAIL_CONFIG } from '../definitions/hunting-trail.config';
import {
  PURPOSE_SLUG_MAP,
  PURPOSE_SLUGS,
  PurposeGroupData,
  PurposeSlug,
  TaggedEvent,
  TimelineEventType,
} from '../model/hunting-trail';
import { computeRunStats } from '../model/run-stats';

interface UseHuntingTrailParams {
  from: number | undefined;
  to: number | undefined;
  /**
   * Either a raw qfilter fragment (AND-prepended to every query) or a
   * QueryFilterState[] (prepended into the filter list before QFBuilder).
   * The host view passes `(src_ip:<asset> OR dest_ip:<asset>)`; the
   * network view omits.
   */
  additionalFilter?: string | QueryFilterState[];
}

const allConfigQueries = HUNTING_TRAIL_CONFIG.groups.flatMap((g) => g.queries);

export function useHuntingTrail({
  from,
  to,
  additionalFilter,
}: UseHuntingTrailParams) {
  const qfBuilder = useQFBuilder();
  const { tenant } = useGlobalQueryParams(['tenant']);
  const {
    data: filterSets,
    isLoading: filterSetsLoading,
    isError: filterSetsError,
  } = useFilterSets();

  const resolvedQueries = useMemo<ResolvedQuery[]>(() => {
    const list = filterSets ?? [];
    return allConfigQueries.map((q) =>
      buildQueryParams(q, list, additionalFilter, qfBuilder),
    );
  }, [filterSets, additionalFilter, qfBuilder]);

  const {
    data: resultMap,
    isLoading: endpointLoading,
    isError: endpointError,
  } = useGetHuntingTrailQuery(
    {
      from,
      to,
      tenant,
      resolvedQueries,
    },
    { skip: filterSetsLoading || filterSetsError },
  );

  const isLoading = filterSetsLoading || endpointLoading;
  // The queryFn always returns { data: map } even when every per-query
  // fetch failed. Treat "every per-query result errored" as a top-level
  // error so consumers can render the failure state.
  const allPerQueryErrored = useMemo(() => {
    if (!resultMap) return false;
    const values = Object.values(resultMap);
    return values.length > 0 && values.every((v) => v.isError);
  }, [resultMap]);
  const isError = filterSetsError || endpointError || allPerQueryErrored;

  // Build queryMetadata map for downstream card consumers
  const queryMetadata = useMemo<
    Record<string, { name: string; description: string }>
  >(() => {
    const entries: Array<[string, { name: string; description: string }]> = [];
    for (const rq of resolvedQueries) {
      if (rq.isMissing) {
        // Missing entries: best-effort placeholder (id used as name)
        entries.push([rq.id, { name: rq.id, description: '' }]);
      } else {
        entries.push([rq.id, { name: rq.name, description: rq.description }]);
      }
    }
    return Object.fromEntries(entries);
  }, [resolvedQueries]);

  // Convert resultMap to per-id query results consumable by computeRunStats
  const queryResults = useMemo(() => {
    const map = new Map<
      string,
      { data?: { results?: unknown[] }; isLoading: boolean; isError: boolean }
    >();
    for (const q of allConfigQueries) {
      const r = resultMap?.[q.id];
      map.set(q.id, {
        data: r?.data,
        isLoading: !resultMap,
        isError: r?.isError ?? false,
      });
    }
    return map;
  }, [resultMap]);

  const runStats = computeRunStats(Array.from(queryResults.values()));

  const groups = useMemo(() => {
    return Object.fromEntries(
      PURPOSE_SLUGS.map(({ slug }) => {
        const purposeGroup = PURPOSE_SLUG_MAP[slug];
        const types = purposeGroup.types;
        const queries = types
          .map((t) => queryResults.get(t))
          .filter(Boolean) as Array<{
          data?: { results?: unknown[] };
          isLoading: boolean;
          isError: boolean;
        }>;
        const groupLoading = queries.some((q) => q.isLoading);
        const groupError =
          queries.length > 0 && queries.every((q) => q.isError);

        const events: TaggedEvent[] = types.flatMap((type) => {
          const results = queryResults.get(type)?.data?.results ?? [];
          return results.map(
            (e) =>
              ({
                ...(e as object),
                timelineType: type as TimelineEventType,
              }) as TaggedEvent,
          );
        });

        return [
          slug,
          {
            events,
            count: events.length,
            isLoading: groupLoading,
            isError: groupError,
          },
        ];
      }),
    ) as Record<PurposeSlug, PurposeGroupData>;
  }, [queryResults]);

  const isEmpty =
    !isLoading && !isError && Object.values(groups).every((g) => g.count === 0);

  return { groups, isLoading, isError, isEmpty, runStats, queryMetadata };
}

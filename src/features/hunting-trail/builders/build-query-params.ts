import type { FilterSet, FilterSetTags } from '@/features/filter-sets';
import type {
  AlertTagFlags,
  EventTypeFlags,
  PersistedFilter,
  QueryFilterState,
} from '@/features/query-filters';

import type { HuntingTrailQuery } from '../definitions/hunting-trail.config';

export type ResolvedQuery =
  | { id: string; isMissing: true }
  | {
      id: string;
      isMissing?: false;
      endpoint: 'alerts_tail' | 'events_tail';
      qfilter: string;
      name: string;
      description: string;
      eventTypeFlags: EventTypeFlags;
    };

type QFBuilderLike = {
  toQFString(
    filters?: Omit<QueryFilterState, 'id'>[],
    alertTags?: AlertTagFlags | null,
  ): string | undefined;
};

const mapPersistedToFilterState = (
  filter: PersistedFilter,
): Omit<QueryFilterState, 'id'> => ({
  key: filter.id,
  value: filter.value,
  isSuspended: false,
  isNegated: filter.negated,
  isWildcarded: filter.id === 'es_filter' ? false : !filter.fullString,
});

// Every alert-tag flag defaults to true; the filterset's `tags` only
// overrides when a key is explicitly false. Missing or undefined keys
// stay true. Differs from useFilterSetQueryParams' app-flags fallback —
// hunting-trail is permissive by default because its catalog is curated.
const mergeAlertTags = (tags: FilterSetTags | undefined): AlertTagFlags => ({
  relevant: tags?.relevant !== false,
  untagged: tags?.untagged !== false,
  informational: tags?.informational !== false,
});

// Same all-true-default policy for event-type flags. Static entries
// (no filterset) get the full-open default.
const mergeEventTypeFlags = (
  tags: FilterSetTags | undefined,
): EventTypeFlags => ({
  alert: tags?.alert !== false,
  stamus: tags?.stamus !== false,
  discovery: tags?.discovery !== false,
});

const filtersetPageToEndpoint = (page: string): 'alerts_tail' | 'events_tail' =>
  page === 'SESSION_EVENTS' ? 'events_tail' : 'alerts_tail';

const andMerge = (left: string | undefined, right: string | undefined) => {
  if (!left) return right ?? '';
  if (!right) return left;
  return `${left} AND ${right}`;
};

/**
 * Resolve a config-declared HuntingTrailQuery into a concrete request shape.
 *
 * `additionalFilter` string contract: must be a single balanced qfilter
 * expression — caller is responsible for paren-wrapping anything that
 * contains operator precedence (`OR`, `AND`). Matches the Slice A hook
 * contract; host-insights and threats consumers already wrap.
 */
export function buildQueryParams(
  query: HuntingTrailQuery,
  filterSets: FilterSet[],
  additionalFilter: string | QueryFilterState[] | undefined,
  qfBuilder: QFBuilderLike,
): ResolvedQuery {
  if (query.kind === 'filterset') {
    const fs = filterSets.find((f) => f.id === query.filtersetId);
    if (!fs) {
      return { id: query.id, isMissing: true };
    }
    const additionalAsArray = Array.isArray(additionalFilter)
      ? additionalFilter
      : undefined;
    const additionalAsString =
      typeof additionalFilter === 'string' ? additionalFilter : undefined;

    const filters = [
      ...(additionalAsArray ?? []),
      ...fs.filters.map(mapPersistedToFilterState),
    ];
    const built = qfBuilder.toQFString(filters, mergeAlertTags(fs.tags)) ?? '';
    const qfilter = additionalAsString
      ? andMerge(additionalAsString, built)
      : built;
    return {
      id: query.id,
      endpoint: filtersetPageToEndpoint(fs.page),
      qfilter,
      name: fs.name,
      description: fs.description,
      eventTypeFlags: mergeEventTypeFlags(fs.tags),
    };
  }

  // kind === 'static'
  const additionalAsString =
    typeof additionalFilter === 'string' ? additionalFilter : undefined;
  const additionalAsArray = Array.isArray(additionalFilter)
    ? additionalFilter
    : undefined;
  const arrayAsString = additionalAsArray
    ? qfBuilder.toQFString(additionalAsArray, undefined)
    : undefined;
  const prefix = additionalAsString ?? arrayAsString;
  const qfilter = prefix ? andMerge(prefix, query.qfilter) : query.qfilter;
  return {
    id: query.id,
    endpoint: query.endpoint,
    qfilter,
    name: query.name,
    description: query.description,
    eventTypeFlags: mergeEventTypeFlags(undefined),
  };
}

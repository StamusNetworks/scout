import { pipe, toPairs } from 'ramda';

import {
  FilterCategory,
  type MixedQueryFilterDefinitions,
  type QueryFilterDefinition,
} from '@/features/query-filters';
import { QueryFiltersRecord } from '@/features/query-filters/definitions/query-filter.definitions';

export const getSupportedFilterKeys = (
  filterDefs:
    | MixedQueryFilterDefinitions
    | Record<string, QueryFilterDefinition>,
): string[] =>
  pipe(
    toArray,
    filterEventType,
    removeUnsupportedFilters,
    toArrayOfKeys,
  )(filterDefs);

const toArray = (
  obj: MixedQueryFilterDefinitions | Record<string, QueryFilterDefinition>,
) => toPairs(obj).map(([key, value]) => ({ key, category: value.category }));

const filterEventType = (
  filters: { key: string; category: FilterCategory }[],
) =>
  filters.filter((f) =>
    (
      [FilterCategory.EVENT, FilterCategory.SIGNATURE] as FilterCategory[]
    ).includes(f.category),
  );

const unsupportedFilters = new Set<keyof typeof QueryFiltersRecord>([
  'hits_min',
  'hits_max',
]);
const removeUnsupportedFilters = (
  filters: { key: string; category: FilterCategory }[],
) =>
  filters.filter(
    (f) => !unsupportedFilters.has(f.key as keyof typeof QueryFiltersRecord),
  );

const toArrayOfKeys = (filters: { key: string; category: FilterCategory }[]) =>
  filters.map((f) => f.key);

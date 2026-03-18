import { pipe, toPairs } from 'ramda';
import { useMemo } from 'react';

import { FilterCategory } from '@/features/filtering/query-filters/constants/query-filter.config';
import { QueryFiltersRecord } from '@/features/filtering/query-filters/constants/query-filter.definition';
import { useQueryFiltersDefinitions } from '@/features/filtering/query-filters/hooks/use-filters-definitions';
import { QueryFilterDefinition } from '@/features/filtering/query-filters/model/query-filter';
import { MixedQueryFilterDefinitions } from '@/features/filtering/query-filters/store/query-filters.selector';

export const useSupportedFilterActionsFilters = () => {
  const filterDefs = useQueryFiltersDefinitions();
  return useMemo(() => getSupportedFiltersKeys(filterDefs), [filterDefs]);
};

export const getSupportedFiltersKeys = (
  filterDefs:
    | MixedQueryFilterDefinitions
    | Record<string, QueryFilterDefinition>,
) =>
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

const unsupportedFilters: (keyof typeof QueryFiltersRecord)[] = [
  'hits_min',
  'hits_max',
];
const removeUnsupportedFilters = (
  filters: { key: string; category: FilterCategory }[],
) => filters.filter((f) => !unsupportedFilters.includes(f.key));

const toArrayOfKeys = (filters: { key: string; category: FilterCategory }[]) =>
  filters.map((f) => f.key);

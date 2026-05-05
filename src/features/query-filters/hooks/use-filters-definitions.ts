import { useMemo } from 'react';

import { useAppSelector } from '@/store/store';

import { QueryFiltersRecord } from '../definitions/query-filter.definitions';
import {
  selectQueryFiltersDefinitions,
  selectQueryFilterTypes,
} from '../state/query-filters.selectors';

/**
 * Looks up one filter definition merged from the static
 * `QueryFiltersRecord` and the live ES-mapping `types`. Memoized on
 * `types` + `filterId` so consumers can list the result in deps.
 */
export const useQueryFilterDefinition = (filterId: string) => {
  const types = useAppSelector(selectQueryFilterTypes);
  return useMemo(() => {
    if (!types) return QueryFiltersRecord[filterId];
    return {
      ...types[filterId],
      ...QueryFiltersRecord[filterId],
    };
  }, [types, filterId]);
};

export const useQueryFiltersDefinitions = () => {
  return useAppSelector(selectQueryFiltersDefinitions);
};

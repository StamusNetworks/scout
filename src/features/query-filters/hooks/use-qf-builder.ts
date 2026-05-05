import { useMemo } from 'react';

import { useAppSelector } from '@/store/store';

import { QFBuilder } from '../builders/qf-builder';
import {
  QueryFilters,
  QueryFiltersRecord,
} from '../definitions/query-filter.definitions';
import { selectQueryFilterTypes } from '../state/query-filters.selectors';

/**
 * Returns a memoized QFBuilder instance bound to the current ES-mapping
 * types. Identity is stable as long as `types` is stable; this matters
 * because consumers list the builder in `useMemo`/`useEffect` deps.
 */
export function useQFBuilder() {
  const types = useAppSelector(selectQueryFilterTypes);

  return useMemo(() => {
    if (!types) return QFBuilder(QueryFiltersRecord, 'raw');
    const combinedTypes = QueryFilters.reduce(
      (acc, curr) => {
        acc[curr.key] = {
          ...curr,
          ...types[curr.key],
        };
        return acc;
      },
      { ...types },
    );
    return QFBuilder(combinedTypes, 'raw');
  }, [types]);
}

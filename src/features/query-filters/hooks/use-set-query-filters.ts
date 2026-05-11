import { useCallback } from 'react';

import { useAppDispatch } from '@/store/store';

import type { QueryFilterState } from '../model/query-filter';
import { setQueryFilters } from '../state/query-filters.slice';

/**
 * Atomically replace the entire query-filters list. Caller is responsible
 * for building the final `QueryFilterState[]` (ids, flags, etc.).
 */
export function useSetQueryFilters(): (filters: QueryFilterState[]) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (filters: QueryFilterState[]) => {
      dispatch(setQueryFilters(filters));
    },
    [dispatch],
  );
}

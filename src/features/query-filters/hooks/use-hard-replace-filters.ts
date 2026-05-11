import { useCallback } from 'react';

import { useAppDispatch } from '@/store/store';

import type { QueryFilterState } from '../model/query-filter';
import { setQueryFilters } from '../state/query-filters.slice';

/**
 * Hard-replace: drop prior state and install `newFilters` atomically.
 * No suspend/merge semantics — use `useSoftReplaceFilters` for that.
 *
 * Atomic single dispatch, so it composes safely with other dispatches in
 * the same tick without stale-closure pitfalls.
 */
export function useHardReplaceFilters(): (
  newFilters: QueryFilterState[],
) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (newFilters: QueryFilterState[]) => {
      dispatch(setQueryFilters(newFilters));
    },
    [dispatch],
  );
}

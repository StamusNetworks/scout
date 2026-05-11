import { useCallback } from 'react';

import { QueryFilterState } from '../model/query-filter';
import { FilterInput } from '../utils/filter-mapper';
import { applyReplaceLogic } from '../utils/suspension-rules';
import { useQFBuilder } from './use-qf-builder';
import { useQueryFilters } from './use-query-filters';
import { useSetQueryFilters } from './use-set-query-filters';

/**
 * Soft-replace: suspend the current filters, then for each new filter
 * either unsuspend a structurally identical existing entry or append a
 * new one. Preserves prior filters as suspended history.
 *
 * Use `useHardReplaceFilters` for an atomic clear-and-set.
 */
export function useSoftReplaceFilters(): (
  newFilters: FilterInput[] | QueryFilterState[],
) => void {
  const current = useQueryFilters();
  const setFilters = useSetQueryFilters();
  const qfBuilder = useQFBuilder();

  return useCallback(
    (newFilters) => {
      const result = applyReplaceLogic(
        current,
        newFilters,
        (key, value, options) => qfBuilder.createFilter(key, value, options),
      );
      setFilters(result);
    },
    [current, setFilters, qfBuilder],
  );
}

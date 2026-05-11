import { useCallback } from 'react';

import { QueryFilterState } from '../model/query-filter';
import { showFilterToast } from '../utils/filter-toast';
import { applySuspensionOnUpdate } from '../utils/suspension-rules';
import { useQueryFilters, useQueryTypes } from './use-query-filters';
import { useSetQueryFilters } from './use-set-query-filters';

export function useUpdateFilter(): (filter: QueryFilterState) => void {
  const filters = useQueryFilters();
  const types = useQueryTypes();
  const setFilters = useSetQueryFilters();

  return useCallback(
    (update: QueryFilterState) => {
      const result = applySuspensionOnUpdate(filters, update, types);
      setFilters(result);
      showFilterToast('updated', update);
    },
    [filters, types, setFilters],
  );
}

import { useCallback } from 'react';

import { QueryFilterState } from '../model/query-filter';
import { useQueryFiltersRepository } from '../state/query-filters.repository';

export function useReorderFilters(): (reordered: QueryFilterState[]) => void {
  const repo = useQueryFiltersRepository();

  return useCallback((reordered) => repo.set(reordered), [repo]);
}

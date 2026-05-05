import { useCallback } from 'react';

import { QueryFilterState } from '../../query-filter.model';
import { useQueryFiltersRepository } from '../../query-filters.repository';

export function useReorderFilters(): (reordered: QueryFilterState[]) => void {
  const repo = useQueryFiltersRepository();

  return useCallback((reordered) => repo.set(reordered), [repo]);
}

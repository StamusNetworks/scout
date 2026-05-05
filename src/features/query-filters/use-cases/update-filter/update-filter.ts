import { useCallback } from 'react';

import { QueryFilterState } from '../../query-filter.model';
import { useQueryFiltersRepository } from '../../query-filters.repository';
import { showFilterToast } from '../../utils/filter-toast';
import { applySuspensionOnUpdate } from '../../utils/suspension-rules';

export function useUpdateFilter(): (filter: QueryFilterState) => void {
  const repo = useQueryFiltersRepository();

  return useCallback(
    (update: QueryFilterState) => {
      const filters = repo.getAll();
      const types = repo.getTypes();
      const result = applySuspensionOnUpdate(filters, update, types);
      repo.set(result);
      showFilterToast('updated', update);
    },
    [repo],
  );
}

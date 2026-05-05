import { useCallback } from 'react';

import { useQFBuilder } from '../../hooks/use-qf-builder';
import { QueryFilterState } from '../../query-filter.model';
import { useQueryFiltersRepository } from '../../query-filters.repository';
import { FilterInput } from '../../utils/filter-mapper';
import { applyReplaceLogic } from '../../utils/suspension-rules';

export function useReplaceFilters(): (
  newFilters: FilterInput[] | QueryFilterState[],
) => void {
  const repo = useQueryFiltersRepository();
  const qfBuilder = useQFBuilder();

  return useCallback(
    (newFilters) => {
      const current = repo.getAll();
      const result = applyReplaceLogic(
        current,
        newFilters,
        (key, value, options) => qfBuilder.createFilter(key, value, options),
      );
      repo.set(result);
    },
    [repo, qfBuilder],
  );
}

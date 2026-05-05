import { useCallback } from 'react';

import { useQFBuilder } from '../hooks/use-qf-builder';
import { useQueryFiltersRepository } from '../state/query-filters.repository';
import { FilterInput } from '../utils/filter-mapper';
import { applyUpsertByRole } from '../utils/suspension-rules';

export function useUpsertFilterByRole(): (input: FilterInput) => void {
  const repo = useQueryFiltersRepository();
  const qfBuilder = useQFBuilder();

  return useCallback(
    (input) => {
      const filters = repo.getAll();
      const newFilter = qfBuilder.createFilter(
        input.key,
        input.value,
        input.options,
      );
      const result = applyUpsertByRole(filters, newFilter);
      repo.set(result);
    },
    [repo, qfBuilder],
  );
}

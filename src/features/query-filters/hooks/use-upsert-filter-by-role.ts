import { useCallback } from 'react';

import { FilterInput } from '../utils/filter-mapper';
import { applyUpsertByRole } from '../utils/suspension-rules';
import { useQFBuilder } from './use-qf-builder';
import { useQueryFilters } from './use-query-filters';
import { useSetQueryFilters } from './use-set-query-filters';

export function useUpsertFilterByRole(): (input: FilterInput) => void {
  const filters = useQueryFilters();
  const setFilters = useSetQueryFilters();
  const qfBuilder = useQFBuilder();

  return useCallback(
    (input) => {
      const newFilter = qfBuilder.createFilter(
        input.key,
        input.value,
        input.options,
      );
      const result = applyUpsertByRole(filters, newFilter);
      setFilters(result);
    },
    [filters, setFilters, qfBuilder],
  );
}

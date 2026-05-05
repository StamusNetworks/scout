import { useCallback } from 'react';

import { useQFBuilder } from '../hooks/use-qf-builder';
import { useQueryFiltersRepository } from '../state/query-filters.repository';
import { FilterInput } from '../utils/filter-mapper';
import { showFilterToast } from '../utils/filter-toast';
import {
  applyDeduplication,
  applySuspensionOnAdd,
} from '../utils/suspension-rules';

export function useCreateFilter(): (input: FilterInput) => void {
  const repo = useQueryFiltersRepository();
  const qfBuilder = useQFBuilder();

  return useCallback(
    (input: FilterInput) => {
      const filters = repo.getAll();
      const types = repo.getTypes();
      const newFilter = qfBuilder.createFilter(
        input.key,
        input.value,
        input.options,
      );
      const suspended = applySuspensionOnAdd(filters, newFilter, types);
      const result = applyDeduplication(suspended, newFilter);
      repo.set(result);
      const isDuplicate = filters.some(
        (f) => f.key === input.key && f.value === input.value,
      );
      showFilterToast(isDuplicate ? 'updated' : 'added', input);
    },
    [repo, qfBuilder],
  );
}

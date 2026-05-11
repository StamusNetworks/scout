import { useCallback } from 'react';

import { FilterInput } from '../utils/filter-mapper';
import { showFilterToast } from '../utils/filter-toast';
import {
  applyDeduplication,
  applySuspensionOnAdd,
} from '../utils/suspension-rules';
import { useQFBuilder } from './use-qf-builder';
import { useQueryFilters, useQueryTypes } from './use-query-filters';
import { useSetQueryFilters } from './use-set-query-filters';

export function useCreateFilter(): (input: FilterInput) => void {
  const filters = useQueryFilters();
  const types = useQueryTypes();
  const setFilters = useSetQueryFilters();
  const qfBuilder = useQFBuilder();

  return useCallback(
    (input: FilterInput) => {
      const newFilter = qfBuilder.createFilter(
        input.key,
        input.value,
        input.options,
      );
      const suspended = applySuspensionOnAdd(filters, newFilter, types);
      const result = applyDeduplication(suspended, newFilter);
      setFilters(result);
      const isDuplicate = filters.some(
        (f) => f.key === input.key && f.value === input.value,
      );
      showFilterToast(isDuplicate ? 'updated' : 'added', input);
    },
    [filters, types, setFilters, qfBuilder],
  );
}

import { useMemo } from 'react';
import { toast } from 'sonner';

import { QueryFilterState } from '../model/query-filter';
import { applyToggleSuspension } from '../utils/suspension-rules';
import { useQueryFilters, useQueryTypes } from './use-query-filters';
import { useSetQueryFilters } from './use-set-query-filters';

export function useSuspendFilter() {
  const filters = useQueryFilters();
  const types = useQueryTypes();
  const setFilters = useSetQueryFilters();

  return useMemo(
    () => ({
      toggle: (filterId: string) => {
        const result = applyToggleSuspension(filters, filterId, types);
        setFilters(result);
      },
      suspendMany: (predicate: (f: QueryFilterState) => boolean) => {
        setFilters(
          filters.map((f) => (predicate(f) ? { ...f, isSuspended: true } : f)),
        );
      },
      clearSuspended: () => {
        setFilters(filters.filter((f) => !f.isSuspended));
        toast.success('Cleared suspended filters');
      },
    }),
    [filters, types, setFilters],
  );
}

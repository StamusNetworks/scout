import { useMemo } from 'react';
import { toast } from 'sonner';

import { QueryFilterState } from '../model/query-filter';
import { useQueryFiltersRepository } from '../state/query-filters.repository';
import { applyToggleSuspension } from '../utils/suspension-rules';

export function useSuspendFilter() {
  const repo = useQueryFiltersRepository();

  return useMemo(
    () => ({
      toggle: (filterId: string) => {
        const filters = repo.getAll();
        const types = repo.getTypes();
        const result = applyToggleSuspension(filters, filterId, types);
        repo.set(result);
      },
      suspendMany: (predicate: (f: QueryFilterState) => boolean) => {
        const filters = repo.getAll();
        repo.set(
          filters.map((f) => (predicate(f) ? { ...f, is_suspended: true } : f)),
        );
      },
      clearSuspended: () => {
        const filters = repo.getAll();
        repo.set(filters.filter((f) => !f.is_suspended));
        toast.success('Cleared suspended filters');
      },
    }),
    [repo],
  );
}

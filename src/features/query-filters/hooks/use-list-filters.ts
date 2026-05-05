import { useMemo } from 'react';

import { useQueryFiltersRepository } from '../state/query-filters.repository';

export function useListFilters() {
  const repo = useQueryFiltersRepository();
  const filters = repo.getAll();

  return useMemo(
    () => ({
      all: filters,
      active: filters.filter((f) => !f.isSuspended),
      suspended: filters.filter((f) => f.isSuspended),
    }),
    [filters],
  );
}

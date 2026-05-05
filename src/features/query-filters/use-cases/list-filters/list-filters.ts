import { useMemo } from 'react';

import { useQueryFiltersRepository } from '../../query-filters.repository';

export function useListFilters() {
  const repo = useQueryFiltersRepository();
  const filters = repo.getAll();

  return useMemo(
    () => ({
      all: filters,
      active: filters.filter((f) => !f.is_suspended),
      suspended: filters.filter((f) => f.is_suspended),
    }),
    [filters],
  );
}

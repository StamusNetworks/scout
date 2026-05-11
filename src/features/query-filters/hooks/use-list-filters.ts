import { useMemo } from 'react';

import { useAppSelector } from '@/store/store';

import { selectQueryFilters } from '../state/query-filters.selectors';

export function useListFilters() {
  const filters = useAppSelector(selectQueryFilters);

  return useMemo(
    () => ({
      all: filters,
      active: filters.filter((f) => !f.isSuspended),
      suspended: filters.filter((f) => f.isSuspended),
    }),
    [filters],
  );
}

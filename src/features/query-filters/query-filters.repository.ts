import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import type { QueryFilterState } from './query-filter.model';
import { clearQueryFilters, setQueryFilters } from './query-filters.store';

export type QueryFiltersRepository = {
  getAll(): QueryFilterState[];
  getTypes(): Record<string, { type: string }> | undefined;
  set(filters: QueryFilterState[]): void;
  clear(): void;
};

export function useQueryFiltersRepository(): QueryFiltersRepository {
  const filters = useAppSelector(
    (state) => state.filters.queryFilters.queryFilters,
  );
  const types = useAppSelector((state) => state.filters.queryFilters.types);
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      getAll: () => filters,
      getTypes: () => types,
      set: (newFilters: QueryFilterState[]) => {
        dispatch(setQueryFilters(newFilters));
      },
      clear: () => {
        dispatch(clearQueryFilters());
      },
    }),
    [filters, types, dispatch],
  );
}

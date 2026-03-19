import { useMemo } from 'react';

import { setTagFilters } from '@/features/filtering/filters/query-filters/query-filters.store';
import { useAppDispatch, useAppSelector } from '@/store/store';

import type { TagFilters } from './tag-filters.model';

export type TagFiltersRepository = {
  getAll(): TagFilters;
  set(tags: Partial<TagFilters>): void;
};

export function useTagFiltersRepository(): TagFiltersRepository {
  const tags = useAppSelector((state) => state.filters.queryFilters.tagFilters);
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      getAll: () => tags,
      set: (newTags: Partial<TagFilters>) => dispatch(setTagFilters(newTags)),
    }),
    [tags, dispatch],
  );
}

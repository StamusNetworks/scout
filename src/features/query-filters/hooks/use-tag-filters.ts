import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  type AlertTagFlags,
  type EventTypeFlags,
  type FilterFlags,
} from '../model/filter-flags';
import {
  setAlertTags,
  setEventTypes,
  setNovelty,
} from '../state/query-filters.slice';

export type TagFiltersRepository = {
  getAll(): FilterFlags;
  setEventTypes(flags: Partial<EventTypeFlags>): void;
  setAlertTags(flags: Partial<AlertTagFlags>): void;
  setNovelty(value: boolean): void;
};

export function useTagFiltersRepository(): TagFiltersRepository {
  const flags = useAppSelector((state) => state.filters.queryFilters.flags);
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      getAll: () => flags,
      setEventTypes: (next) => dispatch(setEventTypes(next)),
      setAlertTags: (next) => dispatch(setAlertTags(next)),
      setNovelty: (value) => dispatch(setNovelty(value)),
    }),
    [flags, dispatch],
  );
}

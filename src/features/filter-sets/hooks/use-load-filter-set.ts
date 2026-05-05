import { useCallback } from 'react';
import { toast } from 'sonner';

import {
  useQFBuilder,
  useQueryFiltersRepository,
  useFilterFlagsRepository,
} from '@/features/query-filters';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { type FilterSet } from '../model/filter-set';
import {
  selectLoadedFilterSetId,
  setLoadedFilterSetId,
} from '../state/filter-sets.slice';

/**
 * Loads a saved filter set into the live query-filters state. Skips
 * if the same filter set is already loaded. The loaded id is tracked
 * separately so the UI can highlight the current set.
 */
export const useLoadFilterSet = () => {
  const dispatch = useAppDispatch();
  const loadedFilterSetId = useAppSelector(selectLoadedFilterSetId);
  const qfBuilder = useQFBuilder();
  const tagFiltersRepo = useFilterFlagsRepository();
  const queryFiltersRepo = useQueryFiltersRepository();

  return useCallback(
    (filterSet: FilterSet) => {
      if (loadedFilterSetId === filterSet.id) return;

      if (filterSet.tags) {
        tagFiltersRepo.setEventTypes({
          alert: filterSet.tags.alert,
          stamus: filterSet.tags.stamus,
          discovery: filterSet.tags.discovery,
        });
        tagFiltersRepo.setAlertTags({
          relevant: filterSet.tags.relevant,
          informational: filterSet.tags.informational,
          untagged: filterSet.tags.untagged,
        });
      }

      const newFilters = filterSet.filters.map((filter) =>
        qfBuilder.createFilter(filter.id, filter.value as string, {
          is_wildcarded: filter.id === 'es_filter' ? false : !filter.fullString,
          is_negated: filter.negated,
        }),
      );
      queryFiltersRepo.set(newFilters);
      dispatch(setLoadedFilterSetId(filterSet.id));
      toast.success('Filter set applied');
    },
    [dispatch, loadedFilterSetId, qfBuilder, tagFiltersRepo, queryFiltersRepo],
  );
};

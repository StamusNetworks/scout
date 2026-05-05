import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import type { FilterSet } from '../model/filter-set';
import {
  addFilterSets,
  clearFilterSets,
  type QueryFiltersKey,
  removeFilterSet,
  selectLoadedFilterSetId,
  selectFilterSets,
  setLoadedFilterSetId,
} from './filter-sets.slice';

export type FilterSetsRepository = {
  getLoadedId(): number | null;
  getFavorites(): FilterSet[];
  getPinned(): FilterSet[];
  setLoadedId(id: number): void;
  addToCollection(key: QueryFiltersKey, sets: FilterSet[]): void;
  removeFromCollection(key: QueryFiltersKey, id: number): void;
  clearCollection(key: QueryFiltersKey): void;
};

export function useFilterSetsRepository(): FilterSetsRepository {
  const loadedId = useAppSelector(selectLoadedFilterSetId);
  const favorites = useAppSelector((state) =>
    selectFilterSets(state, 'favorites'),
  );
  const pinned = useAppSelector((state) => selectFilterSets(state, 'pinned'));
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      getLoadedId: () => loadedId,
      getFavorites: () => favorites,
      getPinned: () => pinned,
      setLoadedId: (id: number) => dispatch(setLoadedFilterSetId(id)),
      addToCollection: (key: QueryFiltersKey, sets: FilterSet[]) =>
        dispatch(addFilterSets({ key, sets })),
      removeFromCollection: (key: QueryFiltersKey, id: number) =>
        dispatch(removeFilterSet({ key, id })),
      clearCollection: (key: QueryFiltersKey) => dispatch(clearFilterSets(key)),
    }),
    [loadedId, favorites, pinned, dispatch],
  );
}

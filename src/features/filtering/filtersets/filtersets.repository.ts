import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import type { QueryFilterSet } from './filterset.model';
import {
  addQueryFilterSets,
  clearQueryFilterSets,
  type QueryFiltersKey,
  removeQueryFilterSet,
  selectLoadedFilterSetId,
  selectQueryFilterSets,
  setLoadedFilterSetId,
} from './filtersets.store';

export type FilterSetsRepository = {
  getLoadedId(): number | null;
  getFavorites(): QueryFilterSet[];
  getPinned(): QueryFilterSet[];
  setLoadedId(id: number): void;
  addToCollection(key: QueryFiltersKey, sets: QueryFilterSet[]): void;
  removeFromCollection(key: QueryFiltersKey, id: number): void;
  clearCollection(key: QueryFiltersKey): void;
};

export function useFilterSetsRepository(): FilterSetsRepository {
  const loadedId = useAppSelector(selectLoadedFilterSetId);
  const favorites = useAppSelector((state) =>
    selectQueryFilterSets(state, 'favorites'),
  );
  const pinned = useAppSelector((state) =>
    selectQueryFilterSets(state, 'pinned'),
  );
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      getLoadedId: () => loadedId,
      getFavorites: () => favorites,
      getPinned: () => pinned,
      setLoadedId: (id: number) => dispatch(setLoadedFilterSetId(id)),
      addToCollection: (key: QueryFiltersKey, sets: QueryFilterSet[]) =>
        dispatch(addQueryFilterSets({ key, sets })),
      removeFromCollection: (key: QueryFiltersKey, id: number) =>
        dispatch(removeQueryFilterSet({ key, id })),
      clearCollection: (key: QueryFiltersKey) =>
        dispatch(clearQueryFilterSets(key)),
    }),
    [loadedId, favorites, pinned, dispatch],
  );
}

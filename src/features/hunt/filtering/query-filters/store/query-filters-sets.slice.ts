import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState, useAppSelector } from '@/store/store';

import { QueryFilterSet } from '../model/query-filterset.schema';

type QueryFiltersSetsState = {
  loaded: number | null;
  favorites: QueryFilterSet[];
  pinned: QueryFilterSet[];
};

export type QueryFiltersKey = keyof Omit<QueryFiltersSetsState, 'loaded'>;

const initialState: QueryFiltersSetsState = {
  loaded: null,
  favorites: [],
  pinned: [],
};

export const queryFiltersSetsSlice = createSlice({
  name: 'queryFiltersSets',
  initialState,
  reducers: {
    addQueryFilterSets: (
      state,
      action: PayloadAction<{ key: QueryFiltersKey; sets: QueryFilterSet[] }>,
    ) => {
      const newSets = action.payload.sets.filter(
        (set) => !state[action.payload.key].some((s) => s.id === set.id),
      );
      state[action.payload.key].push(...newSets);
    },
    removeQueryFilterSet: (
      state,
      action: PayloadAction<{ key: QueryFiltersKey; id: number }>,
    ) => {
      state[action.payload.key] = state[action.payload.key].filter(
        (set) => set.id !== action.payload.id,
      );
    },
    clearQueryFilterSets: (state, action: PayloadAction<QueryFiltersKey>) => {
      state[action.payload] = [];
    },
  },
});

export const {
  addQueryFilterSets,
  removeQueryFilterSet,
  clearQueryFilterSets,
} = queryFiltersSetsSlice.actions;

export const queryFiltersSetsInitialState = initialState;

export const selectQueryFilterSets = (state: RootState, key: QueryFiltersKey) =>
  state.filters.queryFiltersSets[key];

export const selectLoadedFilterSetId = (state: RootState) =>
  state.filters.queryFiltersSets.loaded;

export const useIsLoadedFilterSet = (id: number) => {
  const loadedFilterSetId = useAppSelector((state: RootState) =>
    selectLoadedFilterSetId(state),
  );
  return loadedFilterSetId === id;
};

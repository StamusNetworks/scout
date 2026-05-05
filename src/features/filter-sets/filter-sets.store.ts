import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  clearQueryFilters,
  setAlertTags,
  setEventTypes,
  setNovelty,
  setQueryFilters,
} from '@/features/query-filters/state/query-filters.slice';
import { RootState, useAppSelector } from '@/store/store';

import { type FilterSet } from './model/filter-set';

type QueryFiltersSetsState = {
  loaded: number | null;
  favorites: FilterSet[];
  pinned: FilterSet[];
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
    addFilterSets: (
      state,
      action: PayloadAction<{ key: QueryFiltersKey; sets: FilterSet[] }>,
    ) => {
      const newSets = action.payload.sets.filter(
        (set) => !state[action.payload.key].some((s) => s.id === set.id),
      );
      state[action.payload.key].push(...newSets);
    },
    removeFilterSet: (
      state,
      action: PayloadAction<{ key: QueryFiltersKey; id: number }>,
    ) => {
      state[action.payload.key] = state[action.payload.key].filter(
        (set) => set.id !== action.payload.id,
      );
    },
    clearFilterSets: (state, action: PayloadAction<QueryFiltersKey>) => {
      state[action.payload] = [];
    },
    setLoadedFilterSetId: (state, action: PayloadAction<number>) => {
      state.loaded = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setQueryFilters, (state) => {
      state.loaded = null;
    });
    builder.addCase(clearQueryFilters, (state) => {
      state.loaded = null;
    });
    builder.addCase(setEventTypes, (state) => {
      state.loaded = null;
    });
    builder.addCase(setAlertTags, (state) => {
      state.loaded = null;
    });
    builder.addCase(setNovelty, (state) => {
      state.loaded = null;
    });
  },
});

export const {
  addFilterSets,
  removeFilterSet,
  clearFilterSets,
  setLoadedFilterSetId,
} = queryFiltersSetsSlice.actions;

export const queryFiltersSetsInitialState = initialState;

export const selectFilterSets = (state: RootState, key: QueryFiltersKey) =>
  state.filters.queryFiltersSets[key];

export const selectLoadedFilterSetId = (state: RootState) =>
  state.filters.queryFiltersSets.loaded;

export const useIsLoadedFilterSet = (id: number) => {
  const loadedFilterSetId = useAppSelector((state: RootState) =>
    selectLoadedFilterSetId(state),
  );
  return loadedFilterSetId === id;
};

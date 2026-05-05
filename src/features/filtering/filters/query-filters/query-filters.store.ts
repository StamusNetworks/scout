import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { isNil, toPairs } from 'ramda';

import { startsWithOneOf } from '@/common/lib/strings';
import { ESMappingAPI } from '@/features/filtering/es-mapping/es-mapping.api';
import type { TagFilters } from '@/features/filtering/filters/tag-filters/tag-filters.model';

import { QueryFilterState, QueryFilterType } from './query-filter.model';

export type {
  AlertTags,
  EventTypes,
  Novelty,
  TagFilters,
} from '@/features/filtering/filters/tag-filters/tag-filters.model';

const blacklisted = ['agent', 'beaconing_statistics'];

type QueryFiltersSliceState = {
  queryFilters: QueryFilterState[];
  tagFilters: TagFilters;
  types: Record<string, { type: QueryFilterType }> | undefined;
};

const initialState: QueryFiltersSliceState = {
  queryFilters: [],
  tagFilters: {
    novelty: false,
    informational: true,
    relevant: true,
    untagged: true,
    stamus: true,
    alert: true,
    discovery: true,
  },
  types: undefined,
};

export const queryFiltersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setQueryFilters: (state, action: PayloadAction<QueryFilterState[]>) => {
      state.queryFilters = action.payload;
    },
    clearQueryFilters: (state) => {
      state.queryFilters = [];
    },
    setTagFilters: (state, action: PayloadAction<Partial<TagFilters>>) => {
      toPairs(action.payload)
        .filter((value) => !isNil(value))
        .forEach(([key, value]) => {
          if (!isNil(value)) {
            state.tagFilters[key] = value;
          }
        });
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      ESMappingAPI.endpoints.getESMapping.matchFulfilled,
      (state, action) => {
        state.types = toPairs(action.payload).reduce(
          (acc, [key, value]) => {
            if (startsWithOneOf(key, blacklisted)) {
              return acc;
            }
            acc[key] = value;
            return acc;
          },
          {} as Record<string, { type: QueryFilterType }>,
        );
      },
    );
  },
});

export const { setQueryFilters, clearQueryFilters, setTagFilters } =
  queryFiltersSlice.actions;
export const queryFiltersInitialState = initialState;

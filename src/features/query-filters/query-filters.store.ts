import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { toPairs } from 'ramda';

import { startsWithOneOf } from '@/common/lib/strings';
import { ESMappingAPI } from '@/features/query-filters/api/es-mapping.api';

import {
  type AlertTagFlags,
  defaultFilterFlags,
  type EventTypeFlags,
  type FilterFlags,
} from './filter-flags.model';
import { QueryFilterState, QueryFilterType } from './query-filter.model';

const blacklisted = ['agent', 'beaconing_statistics'];

type QueryFiltersSliceState = {
  queryFilters: QueryFilterState[];
  flags: FilterFlags;
  types: Record<string, { type: QueryFilterType }> | undefined;
};

const initialState: QueryFiltersSliceState = {
  queryFilters: [],
  flags: defaultFilterFlags,
  types: undefined,
};

export const queryFiltersSlice = createSlice({
  name: 'queryFilters',
  initialState,
  reducers: {
    setQueryFilters: (state, action: PayloadAction<QueryFilterState[]>) => {
      state.queryFilters = action.payload;
    },
    clearQueryFilters: (state) => {
      state.queryFilters = [];
    },
    setEventTypes: (state, action: PayloadAction<Partial<EventTypeFlags>>) => {
      Object.assign(state.flags.eventTypes, action.payload);
    },
    setAlertTags: (state, action: PayloadAction<Partial<AlertTagFlags>>) => {
      Object.assign(state.flags.alertTags, action.payload);
    },
    setNovelty: (state, action: PayloadAction<boolean>) => {
      state.flags.novelty = action.payload;
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

export const {
  setQueryFilters,
  clearQueryFilters,
  setEventTypes,
  setAlertTags,
  setNovelty,
} = queryFiltersSlice.actions;
export const queryFiltersInitialState = initialState;

export type {
  AlertTagFlags,
  EventTypeFlags,
  FilterFlags,
} from './filter-flags.model';

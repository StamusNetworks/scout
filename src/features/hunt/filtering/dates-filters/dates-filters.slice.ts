import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { API } from '@/store/api';

import { DatesAPI } from './api/dates-filters.api';
import {
  DatesPayload,
  DatesState,
  UNITS_IN_MILLISECONDS,
} from './dates-filters.types';
import { getPersistedDates, persistDates } from './dates-filters.utils';

const initialState: DatesState = getPersistedDates();

export const datesFiltersSlice = createSlice({
  name: 'datesFilters',
  initialState,
  reducers: {
    setDates: (state, action: PayloadAction<DatesPayload>) => {
      switch (action.payload.type) {
        case 'all':
          state.type = 'all';
          state.start_date = undefined;
          state.end_date = undefined;
          break;
        case 'range':
          state.type = 'range';
          state.start_date = action.payload.start_date;
          state.end_date = action.payload.end_date;
          state.from_duration = undefined;
          state.from_unit = undefined;
          break;
        case 'from':
          state.type = 'from';
          state.from_duration = action.payload.from_duration;
          state.from_unit = action.payload.from_unit;
          state.start_date =
            new Date().getTime() -
            action.payload.from_duration *
              UNITS_IN_MILLISECONDS[action.payload.from_unit!];
          state.end_date = new Date().getTime();
          break;
        case 'auto':
          state.type = 'auto';
          state.start_date = action.payload.start_date;
          state.end_date = action.payload.end_date;
          break;
        default:
          break;
      }
      persistDates(state);
    },
    refreshRange: (state) => {
      if (state.type !== 'from') return;
      state.start_date =
        new Date().getTime() -
        (state.from_duration || 30) *
          UNITS_IN_MILLISECONDS[state.from_unit || 'days'];
      state.end_date = new Date().getTime();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(API.util.invalidateTags(['Reload']).type, (state) => {
      if (state.type !== 'from') return;
      state.start_date =
        new Date().getTime() -
        state.from_duration! * UNITS_IN_MILLISECONDS[state.from_unit!];
      state.end_date = new Date().getTime();
      persistDates(state);
    });
    builder.addMatcher(
      DatesAPI.endpoints.getAutoDateRange.matchFulfilled,
      (state, action) => {
        if (state.type !== 'auto') return;
        state.start_date = action.payload.min_timestamp;
        state.end_date = action.payload.max_timestamp;
        persistDates(state);
      },
    );
  },
});

export const { setDates, refreshRange } = datesFiltersSlice.actions;
export const datesFiltersInitialState = initialState;

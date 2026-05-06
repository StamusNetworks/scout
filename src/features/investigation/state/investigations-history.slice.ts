import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DataEntry } from '@/common/design-system/molecules/value-list-card';
import { type SerializedFilterFlags } from '@/features/query-filters/model/filter-flags';
import { QueryFilterState } from '@/features/query-filters/model/query-filter';
import { RootState } from '@/store/store';

import {
  InvestigationState,
  terminateInvestigation,
} from './investigation.slice';

export type InvestigationHistory = {
  initialParams: {
    start_date: number | undefined;
    end_date: number | undefined;
    qfilter: QueryFilterState[] | undefined;
    /**
     * Snapshot of the active filter flags at save time. The
     * unrelated `tags: string[]` field below holds user-supplied
     * UI labels — different concept, same word.
     */
    flags: SerializedFilterFlags | undefined;
  };
  results: {
    key: string;
    values: DataEntry[];
  }[];
  stages: InvestigationState['stages'];
  comment: string;
  name: string;
  tags: string[];
};

export type InvestigationHistoryState = {
  investigations: InvestigationHistory[];
  currentSave: {
    name: string;
    tags: string[];
    comment: string;
  };
  tags: InvestigationTag[];
};

export type InvestigationTag = {
  name: string;
  variant: 'green' | 'blue' | 'purple' | 'red' | 'sky' | 'yellow' | 'orange';
};

const initialState: InvestigationHistoryState = {
  investigations: [],
  currentSave: {
    name: '',
    tags: [],
    comment: '',
  },
  tags: [
    {
      name: 'Dangerous',
      variant: 'purple',
    },
    {
      name: 'Suspicious',
      variant: 'red',
    },
  ],
};

export const investigationsHistorySlice = createSlice({
  name: 'investigationsHistory',
  initialState,
  reducers: {
    addInvestigation: (state, action: PayloadAction<InvestigationHistory>) => {
      state.investigations.push(action.payload);
    },
    updateCurrentSaveName: (
      state,
      action: PayloadAction<InvestigationHistory['name']>,
    ) => {
      state.currentSave.name = action.payload;
    },
    updateCurrentSaveTags: (
      state,
      action: PayloadAction<InvestigationHistory['tags']>,
    ) => {
      state.currentSave.tags = action.payload;
    },
    updateCurrentSaveComment: (
      state,
      action: PayloadAction<InvestigationHistory['comment']>,
    ) => {
      state.currentSave.comment = action.payload;
    },
    resetCurrentSave: (state) => {
      state.currentSave = {
        ...initialState.currentSave,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addInvestigation, (state) => {
      state.currentSave = {
        ...initialState.currentSave,
      };
    });
    builder.addCase(terminateInvestigation, (state) => {
      state.currentSave = {
        ...initialState.currentSave,
      };
    });
  },
});

export const {
  addInvestigation,
  updateCurrentSaveName,
  updateCurrentSaveComment,
  updateCurrentSaveTags,
} = investigationsHistorySlice.actions;
export const investigationsHistoryInitialState = initialState;

export const selectCurrentSave = createSelector(
  [
    (state: RootState) => state.investigation.history.currentSave.name,
    (state: RootState) => state.investigation.history.currentSave.tags,
    (state: RootState) => state.investigation.history.currentSave.comment,
  ],
  (name, tags, comment) => ({
    name,
    tags,
    comment,
  }),
);

export const selectInvestigationsTags = (state: RootState) =>
  state.investigation.history.tags;

export const selectInvestigations = (state: RootState) =>
  state.investigation.history.investigations;

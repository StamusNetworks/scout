import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { keys } from 'ramda';

import { RootState, useAppSelector } from '@/store/store';

const initialState: HelpState = {
  // HIGHLIGHTS
  highlightTimelineHelp: true,
  highlightGlobalCommands: true,
  // ALERTS
  showFilterSetsBackNavTip: true,
};

export type HelpState = {
  highlightTimelineHelp: boolean;
  highlightGlobalCommands: boolean;
  showFilterSetsBackNavTip: boolean;
};

export const helpSlice = createSlice({
  name: 'help',
  initialState,
  reducers: {
    disableHelp: (state, action: PayloadAction<keyof HelpState>) => {
      state[action.payload] = false;
    },
    resetHelps: (state) => {
      keys(state).forEach((key) => {
        state[key] = true;
      });
    },
  },
});

export const { disableHelp, resetHelps } = helpSlice.actions;
export const helpInitialState = initialState;

export const selectHelpState = (state: RootState) => state.help;
export const useHelpState = () => useAppSelector(selectHelpState);

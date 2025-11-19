import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { keys } from 'ramda';

import { RootState } from '@/store/store';

const initialState: HelpState = {
  showTimelineHelp: true,
};

export type HelpState = {
  showTimelineHelp: boolean;
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

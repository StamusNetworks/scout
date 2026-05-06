import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  actionTypes,
  copyActions,
  downloadActions,
} from '@/common/design-system/molecules/export-button';
import { RootState } from '@/store/store';

const initialState: PreferencesState = {
  timeDisplay: 'human_readable',
  colorBlindness: 'none',
  exportFormat: 'csv',
  exportAction: 'download',
  enabledActions: ['download-csv', 'copy-csv', 'copy-markdown'],
  autoOpenSidebarOnNavigation: true,
  defaultEventDetailTab: 'meta_view',
};

type PreferencesState = {
  timeDisplay: TimeDisplay;
  colorBlindness: ColorBlindness;
  exportFormat: keyof typeof copyActions | keyof typeof downloadActions;
  exportAction: keyof typeof actionTypes;
  enabledActions: ExportAction[];
  autoOpenSidebarOnNavigation: boolean;
  defaultEventDetailTab: EventDetailDefaultTab;
};

export type ExportAction =
  `${keyof typeof actionTypes}-${keyof typeof copyActions | keyof typeof downloadActions}`;

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setTimeDisplay: (state, action: PayloadAction<TimeDisplay>) => {
      state.timeDisplay = action.payload;
    },
    setColorBlindness: (state, action: PayloadAction<ColorBlindness>) => {
      state.colorBlindness = action.payload;
    },
    setExportFormat: (
      state,
      action: PayloadAction<PreferencesState['exportFormat']>,
    ) => {
      state.exportFormat = action.payload;
    },
    setExportAction: (
      state,
      action: PayloadAction<PreferencesState['exportAction']>,
    ) => {
      state.exportAction = action.payload;
      if (action.payload === 'download' && state.exportFormat === 'markdown') {
        state.exportFormat = 'csv';
      }
    },
    toggleEnabledAction: (
      state,
      action: PayloadAction<PreferencesState['enabledActions'][number]>,
    ) => {
      const index = state.enabledActions.indexOf(action.payload);
      if (index > -1) {
        state.enabledActions.splice(index, 1);
      } else {
        state.enabledActions.push(action.payload);
      }
    },
    setAutoOpenSidebarOnNavigation: (state, action: PayloadAction<boolean>) => {
      state.autoOpenSidebarOnNavigation = action.payload;
    },
    setDefaultEventDetailTab: (
      state,
      action: PayloadAction<EventDetailDefaultTab>,
    ) => {
      state.defaultEventDetailTab = action.payload;
    },
  },
});

export const {
  setTimeDisplay,
  setColorBlindness,
  setExportFormat,
  setExportAction,
  toggleEnabledAction,
  setAutoOpenSidebarOnNavigation,
  setDefaultEventDetailTab,
} = preferencesSlice.actions;
export const preferencesInitialState = initialState;

export const selectTimeDisplay = (state: RootState) =>
  state.preferences.timeDisplay;

export const selectColorBlindness = (state: RootState) =>
  state.preferences.colorBlindness;

export const selectExportFormat = (state: RootState) =>
  state.preferences.exportFormat;

export const selectExportAction = (state: RootState) =>
  state.preferences.exportAction;

export const selectEnabledActions = (state: RootState) =>
  state.preferences.enabledActions;

export const selectAutoOpenSidebarOnNavigation = (state: RootState) =>
  state.preferences.autoOpenSidebarOnNavigation;

const validEventDetailTabs = new Set<EventDetailDefaultTab>([
  'meta_view',
  'synthetic_view',
  'json_view',
]);

export const selectDefaultEventDetailTab = (state: RootState) =>
  validEventDetailTabs.has(state.preferences.defaultEventDetailTab)
    ? state.preferences.defaultEventDetailTab
    : 'meta_view';

export type EventDetailDefaultTab =
  | 'meta_view'
  | 'synthetic_view'
  | 'json_view';

export type TimeDisplay =
  | 'relative'
  | 'human_readable'
  | 'iso_8601'
  | 'utc'
  | 'local';

export type ColorBlindness = 'none' | 'prot-deut' | 'trit';

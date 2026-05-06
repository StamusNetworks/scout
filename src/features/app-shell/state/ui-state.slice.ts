import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { setQueryFilters } from '@/features/query-filters/state/query-filters.slice';
import { RootState } from '@/store/store';

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as Theme) || 'system',
  openModal: null,
  isSidebarOpen: false,
  autoReloadInterval: 0,
  autoReloadStartDate: 0,
  jsonViewOpen: 10,
  autoOpenSidebarOnFilterAdd: true,
  withPageContainer: true,
};

export type BaseTheme = 'dark' | 'light' | 'catppuccin' | 'diesel' | 'matrix';

export type Theme = 'system' | BaseTheme;

export type Modal = 'globalCommand';

type UIState = {
  theme: Theme;
  openModal: null | Modal;
  isSidebarOpen: boolean;
  autoReloadInterval: number;
  autoReloadStartDate: number;
  jsonViewOpen: number;
  autoOpenSidebarOnFilterAdd: boolean;
  withPageContainer: boolean;
};

export const uiStateSlice = createSlice({
  name: 'uiState',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setOpenModal: (state, action: PayloadAction<UIState['openModal']>) => {
      if (action.payload === state.openModal) {
        state.openModal = null;
        return;
      }
      state.openModal = action.payload;
    },
    setIsSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setAutoReloadInterval: (
      state,
      action: PayloadAction<UIState['autoReloadInterval']>,
    ) => {
      state.autoReloadInterval = action.payload;
      if (state.autoReloadInterval === 0) {
        state.autoReloadStartDate = 0;
      } else {
        state.autoReloadStartDate = new Date().getTime();
      }
    },
    resetAutoReloadStartDate: (state) => {
      state.autoReloadStartDate = new Date().getTime();
    },
    setJsonViewOpen: (state, action: PayloadAction<number>) => {
      state.jsonViewOpen = action.payload;
    },
    setAutoOpenSidebarOnFilterAdd: (state, action: PayloadAction<boolean>) => {
      state.autoOpenSidebarOnFilterAdd = action.payload;
    },
    setWithPageContainer: (state, action: PayloadAction<boolean>) => {
      state.withPageContainer = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setQueryFilters, (state) => {
      if (state.autoOpenSidebarOnFilterAdd) {
        state.isSidebarOpen = true;
      }
    });
  },
});

export const {
  setTheme,
  setOpenModal,
  setIsSidebarOpen,
  setAutoReloadInterval,
  resetAutoReloadStartDate,
  setJsonViewOpen,
  setAutoOpenSidebarOnFilterAdd,
  setWithPageContainer,
} = uiStateSlice.actions;
export const uiStateInitialState = initialState;

export const selectIsModalOpen = (modal: Modal) => (state: RootState) =>
  state.uiState.openModal === modal;

export const selectAutoReloadInterval = (state: RootState) =>
  state.uiState.autoReloadInterval;

export const selectAutoReloadStartDate = (state: RootState) =>
  state.uiState.autoReloadStartDate;

export const selectJsonViewOpen = (state: RootState) =>
  state.uiState.jsonViewOpen;

export const selectIsSidebarOpen = (state: RootState) =>
  state.uiState.isSidebarOpen;

export const selectAutoOpenSidebarOnFilterAdd = (state: RootState) =>
  state.uiState.autoOpenSidebarOnFilterAdd;

export const selectWithPageContainer = (state: RootState) =>
  state.uiState.withPageContainer;

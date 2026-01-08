import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

export type HostsValuesSort =
  | 'first-seen-asc'
  | 'first-seen-desc'
  | 'last-seen-asc'
  | 'last-seen-desc';

type HostsPageState = {
  sort: HostsValuesSort;
};

const initialState: HostsPageState = {
  sort: 'last-seen-desc',
};

export const hostsPageStateSlice = createSlice({
  name: 'hostsPageState',
  initialState,
  reducers: {
    setSort: (state, action: PayloadAction<HostsPageState['sort']>) => {
      state.sort = action.payload;
    },
  },
});

export const { setSort } = hostsPageStateSlice.actions;

export const selectHostsPageState = (state: RootState) => state.pages.hosts;

export const selectSort = (state: RootState) =>
  selectHostsPageState(state).sort;

export const hostsPageInitialState = initialState;

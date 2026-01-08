import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { keys } from 'ramda';

import {
  CEdashboard,
  dashboard,
} from '@/features/hunt/dashboard/components/dashboard.config';
import { RootState } from '@/store/store';

const getPanelsOrdering = (enterprise: boolean) => {
  const dashboardKeys = Object.keys(
    enterprise ? dashboard : CEdashboard,
  ) as (keyof typeof dashboard)[];
  const localStoragePanelsOrdering = JSON.parse(
    localStorage.getItem('dashboard-panels-ordering') || '[]',
  );
  const localStorageIsValid = dashboardKeys.every((key) =>
    localStoragePanelsOrdering.includes(key),
  );
  return localStorageIsValid ? localStoragePanelsOrdering : dashboardKeys;
};

const initialState: DashboardState = {
  ordering: 'descending',
  chartTarget: false,
  pageSize: 5,
  panelsOrdering: [],
  collapsedPanels: [],
  hideEmptyPanels: true,
  disabledKeys: JSON.parse(
    localStorage.getItem('dashboard-disabled-keys') || '[]',
  ),
};

export type DashboardState = {
  ordering: 'ascending' | 'descending';
  chartTarget: boolean;
  pageSize: number;
  panelsOrdering: (keyof typeof dashboard)[];
  collapsedPanels: (keyof typeof dashboard)[];
  hideEmptyPanels: boolean;
  disabledKeys: string[];
};

export const dashboardPageStateSlice = createSlice({
  name: 'dashboardPageState',
  initialState,
  reducers: {
    setOrdering: (state, action: PayloadAction<DashboardState['ordering']>) => {
      state.ordering = action.payload;
    },
    setChartTarget: (
      state,
      action: PayloadAction<DashboardState['chartTarget']>,
    ) => {
      state.chartTarget = action.payload;
    },
    setPageSize: (state, action: PayloadAction<DashboardState['pageSize']>) => {
      if (action.payload < 5 || action.payload > 20) return;
      state.pageSize = action.payload;
    },
    toggleCollapse: (state, action: PayloadAction<keyof typeof dashboard>) => {
      const index = state.collapsedPanels.indexOf(action.payload);
      if (index === -1) {
        state.collapsedPanels.push(action.payload);
      } else {
        state.collapsedPanels.splice(index, 1);
      }
    },
    movePanelUp: (
      state,
      action: PayloadAction<{
        panelId: keyof typeof dashboard;
      }>,
    ) => {
      const index = state.panelsOrdering.indexOf(action.payload.panelId);
      if (index === -1) return;
      const newIndex = index - 1;
      if (newIndex < 0) return;
      state.panelsOrdering.splice(index, 1);
      state.panelsOrdering.splice(newIndex, 0, action.payload.panelId);
      localStorage.setItem(
        'dashboard-panels-ordering',
        JSON.stringify(state.panelsOrdering),
      );
    },
    movePanelDown: (
      state,
      action: PayloadAction<{
        panelId: keyof typeof dashboard;
      }>,
    ) => {
      const index = state.panelsOrdering.indexOf(action.payload.panelId);
      if (index === -1) return;
      const newIndex = index + 1;
      if (newIndex > state.panelsOrdering.length - 1) return;
      state.panelsOrdering.splice(index, 1);
      state.panelsOrdering.splice(newIndex, 0, action.payload.panelId);
      localStorage.setItem(
        'dashboard-panels-ordering',
        JSON.stringify(state.panelsOrdering),
      );
    },
    toggleDisabledKey: (state, action: PayloadAction<string>) => {
      const index = state.disabledKeys.indexOf(action.payload);
      if (index === -1) {
        state.disabledKeys.push(action.payload);
      } else {
        state.disabledKeys.splice(index, 1);
      }
      localStorage.setItem(
        'dashboard-disabled-keys',
        JSON.stringify(state.disabledKeys),
      );
    },
    collapseAllPanels: (state) => {
      state.collapsedPanels = keys(dashboard);
    },
    expandAllPanels: (state) => {
      state.collapsedPanels = [];
    },
    toggleHideEmptyPanels: (state) => {
      state.hideEmptyPanels = !state.hideEmptyPanels;
    },
    initializePanelsOrdering: (
      state,
      action: PayloadAction<{ enterprise: boolean }>,
    ) => {
      state.panelsOrdering = getPanelsOrdering(action.payload.enterprise);
    },
  },
});

export const {
  setOrdering,
  setChartTarget,
  setPageSize,
  movePanelDown,
  movePanelUp,
  toggleCollapse,
  toggleDisabledKey,
  collapseAllPanels,
  expandAllPanels,
  toggleHideEmptyPanels,
  initializePanelsOrdering,
} = dashboardPageStateSlice.actions;

export const selectDashboardPageState = (state: RootState) => ({
  dashboardPageState: state.pages.explorer,
});

export const dashboardPageStateInitialState = initialState;

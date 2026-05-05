import { RootState } from '@/store/store';

import { dashboard } from '../definitions/dashboard.config';

export const selectDashboardPageState = (state: RootState) =>
  state.pages.explorer;

export const selectOrdering = (state: RootState) =>
  selectDashboardPageState(state).ordering;

export const selectChartTarget = (state: RootState) =>
  selectDashboardPageState(state).chartTarget;

export const selectPageSize = (state: RootState) =>
  selectDashboardPageState(state).pageSize;

export const selectPanelsOrder = (state: RootState) =>
  selectDashboardPageState(state).panelsOrdering;

export const selectIsPanelCollapsed =
  (panelId: keyof typeof dashboard) => (state: RootState) =>
    selectDashboardPageState(state).collapsedPanels.includes(panelId);

export const selectCanPanelMoveUp =
  (panelId: keyof typeof dashboard) => (state: RootState) =>
    selectPanelsOrder(state).findIndex((key) => key === panelId) > 0;

export const selectCanPanelMoveDown =
  (panelId: keyof typeof dashboard) => (state: RootState) =>
    selectPanelsOrder(state).findIndex((key) => key === panelId) <
    selectPanelsOrder(state).length - 1;

export const selectDisabledKeys = (state: RootState) =>
  selectDashboardPageState(state).disabledKeys;

export const selectHideEmptyPanels = (state: RootState) =>
  selectDashboardPageState(state).hideEmptyPanels;

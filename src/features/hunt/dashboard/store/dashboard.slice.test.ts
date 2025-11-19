import { describe, expect, test } from 'vitest';

import { setupStore } from '@/store/store';
import { initialState } from '@/store/store.init';

import {
  dashboardPageStateInitialState,
  DashboardState,
  movePanelDown,
  movePanelUp,
  setChartTarget,
  setOrdering,
  setPageSize,
  toggleCollapse,
} from './dashboard.slice';

const selectDashboardPageState = (reduxStore: ReturnType<typeof setupStore>) =>
  reduxStore.getState().pages.explorer;

const initializeTest = (stateUpdate: Partial<DashboardState> = {}) => {
  const reduxStore = setupStore({
    ...initialState,
    pages: {
      ...initialState.pages,
      explorer: {
        ...dashboardPageStateInitialState,
        ...stateUpdate,
      },
    },
  });
  return {
    reduxStore,
  };
};

describe('Dashboard page state slice', () => {
  describe('Ordering', () => {
    test('Should be descending by default', () => {
      const { reduxStore } = initializeTest();
      const ordering = selectDashboardPageState(reduxStore).ordering;
      expect(ordering).toBe('descending');
    });
    test('Should set descending ordering', () => {
      const { reduxStore } = initializeTest();
      reduxStore.dispatch(setOrdering('ascending'));
      const ordering = selectDashboardPageState(reduxStore).ordering;
      expect(ordering).toBe('ascending');
    });
  });
  describe('Chart target', () => {
    test('Should be false by default', () => {
      const { reduxStore } = initializeTest();
      const chartTarget = selectDashboardPageState(reduxStore).chartTarget;
      expect(chartTarget).toBe(false);
    });
    test('Should set true', () => {
      const { reduxStore } = initializeTest();
      reduxStore.dispatch(setChartTarget(true));
      const chartTarget = selectDashboardPageState(reduxStore).chartTarget;
      expect(chartTarget).toBe(true);
    });
  });
  describe('Page size', () => {
    test('Should be 5 by default', () => {
      const { reduxStore } = initializeTest();
      const pageSize = selectDashboardPageState(reduxStore).pageSize;
      expect(pageSize).toBe(5);
    });
    test('Should set 10', () => {
      const { reduxStore } = initializeTest();
      reduxStore.dispatch(setPageSize(10));
      const pageSize = selectDashboardPageState(reduxStore).pageSize;
      expect(pageSize).toBe(10);
    });
    test('Should not set to higher than 20', () => {
      const { reduxStore } = initializeTest();
      reduxStore.dispatch(setPageSize(40));
      const pageSize = selectDashboardPageState(reduxStore).pageSize;
      expect(pageSize).toBe(5);
    });
    test('Should not set to lower than 5', () => {
      const { reduxStore } = initializeTest();
      reduxStore.dispatch(setPageSize(4));
      const pageSize = selectDashboardPageState(reduxStore).pageSize;
      expect(pageSize).toBe(5);
    });
  });
  describe('Panels ordering', () => {
    test('Should not move up first panel', () => {
      const { reduxStore } = initializeTest({
        panelsOrdering: ['dns', 'basic'],
      });
      reduxStore.dispatch(movePanelUp({ panelId: 'dns' }));
      const panelsOrder = selectDashboardPageState(reduxStore).panelsOrdering;
      expect(panelsOrder).toEqual(['dns', 'basic']);
    });
    test('Should move up second+ panel', () => {
      const { reduxStore } = initializeTest({
        panelsOrdering: ['dns', 'basic'],
      });
      reduxStore.dispatch(movePanelUp({ panelId: 'basic' }));
      const panelsOrder = selectDashboardPageState(reduxStore).panelsOrdering;
      expect(panelsOrder).toEqual(['basic', 'dns']);
    });
    test('Should not move down last panel', () => {
      const { reduxStore } = initializeTest({
        panelsOrdering: ['dns', 'basic'],
      });
      reduxStore.dispatch(movePanelDown({ panelId: 'basic' }));
      const panelsOrder = selectDashboardPageState(reduxStore).panelsOrdering;
      expect(panelsOrder).toEqual(['dns', 'basic']);
    });
    test('Should move down before last panel', () => {
      const { reduxStore } = initializeTest({
        panelsOrdering: ['dns', 'basic'],
      });
      reduxStore.dispatch(movePanelDown({ panelId: 'dns' }));
      const panelsOrder = selectDashboardPageState(reduxStore).panelsOrdering;
      expect(panelsOrder).toEqual(['basic', 'dns']);
    });
  });
  describe('Panels collapsing', () => {
    test('No pannels should be collapsed by default', () => {
      const { reduxStore } = initializeTest();
      const collapsed = selectDashboardPageState(reduxStore).collapsedPanels;
      expect(collapsed).toEqual([]);
    });
    test('Should collapse a panel', () => {
      const { reduxStore } = initializeTest();
      reduxStore.dispatch(toggleCollapse('basic'));
      const collapsed = selectDashboardPageState(reduxStore).collapsedPanels;
      expect(collapsed).toEqual(['basic']);
    });
    test('Should expand a collapsed panel', () => {
      const { reduxStore } = initializeTest({ collapsedPanels: ['basic'] });
      reduxStore.dispatch(toggleCollapse('basic'));
      expect(selectDashboardPageState(reduxStore).collapsedPanels).toEqual([]);
    });
  });
});
